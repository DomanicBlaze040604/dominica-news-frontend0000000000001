import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'sonner';
import { config, shouldLog } from '../config/environment';

// Retry configuration
let retryCount = 0;
const maxRetries = config.apiRetryAttempts || 3;

// Rate limiting configuration - More lenient settings
const rateLimitConfig = {
  maxRequests: 200, // Max requests per window (increased)
  windowMs: 60000, // 1 minute window
  requestQueue: [] as Array<{ timestamp: number; endpoint: string }>,
};

// Request queue for rate limiting
const cleanupOldRequests = () => {
  const now = Date.now();
  rateLimitConfig.requestQueue = rateLimitConfig.requestQueue.filter(
    req => now - req.timestamp < rateLimitConfig.windowMs
  );
};

// Check if request should be rate limited
const shouldRateLimit = (endpoint: string): boolean => {
  cleanupOldRequests();
  
  // Allow unlimited requests for critical endpoints
  const criticalEndpoints = ['/auth/login', '/auth/refresh', '/health'];
  if (criticalEndpoints.some(critical => endpoint.includes(critical))) {
    return false;
  }
  
  return rateLimitConfig.requestQueue.length >= rateLimitConfig.maxRequests;
};

// Add request to queue
const addToRequestQueue = (endpoint: string) => {
  rateLimitConfig.requestQueue.push({
    timestamp: Date.now(),
    endpoint,
  });
};

// Create axios instance with environment-aware configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and metadata
apiClient.interceptors.request.use(
  (config) => {
    const endpoint = config.url || '';
    
    // Check rate limiting
    if (shouldRateLimit(endpoint)) {
      const error = new Error('Rate limit exceeded. Please slow down your requests.');
      (error as any).isRateLimit = true;
      return Promise.reject(error);
    }
    
    // Add to request queue
    addToRequestQueue(endpoint);
    
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request metadata
    (config as AxiosRequestConfig & { metadata?: { startTime: Date; endpoint: string } }).metadata = { 
      startTime: new Date(),
      endpoint 
    };
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return config;
  },
  (error) => {
    if (config.logging.enableConsole && shouldLog('error')) {
      console.error('Request interceptor error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors and retries
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful requests based on configuration
    if (config.logging.enableConsole && shouldLog('debug')) {
      const requestConfig = response.config as AxiosRequestConfig & { metadata?: { startTime: Date } };
      const duration = new Date().getTime() - (requestConfig.metadata?.startTime?.getTime() || 0);
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
    }
    
    // Reset retry count on success
    retryCount = 0;
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean; metadata?: { startTime: Date; endpoint: string } };
    
    // Handle rate limit errors from client-side check
    if ((error as any).isRateLimit) {
      toast.error('Too many requests. Please slow down and try again in a moment.');
      return Promise.reject(error);
    }
    
    // Log errors based on configuration
    if (config.logging.enableConsole && shouldLog('error')) {
      const endpoint = originalRequest?.metadata?.endpoint || originalRequest?.url || 'unknown';
      const method = originalRequest?.method?.toUpperCase() || 'UNKNOWN';
      const status = error.response?.status || 'Network Error';
      console.error(`❌ ${method} ${endpoint} - ${status}`);
      
      // Log additional error details in development
      if (config.isDevelopment) {
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
        });
      }
    }

    // Handle 401 errors by clearing token and redirecting to login
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      toast.error('Session expired. Please log in again.');
      
      // Only redirect if not already on auth page
      if (!window.location.pathname.includes('/auth')) {
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1500);
      }
      
      return Promise.reject(error);
    }

    // Handle 403 errors (forbidden)
    if (error.response?.status === 403) {
      toast.error('Access denied. You do not have permission to perform this action.');
      return Promise.reject(error);
    }

    // Handle 404 errors
    if (error.response?.status === 404) {
      const endpoint = originalRequest?.metadata?.endpoint || originalRequest?.url || '';
      if (endpoint.includes('/admin/')) {
        console.warn(`Admin endpoint not found: ${endpoint}. Using fallback data if available.`);
        // Don't show toast for admin 404s as fallback data will be used
      } else {
        toast.error('Resource not found.');
      }
      return Promise.reject(error);
    }

    // Handle rate limiting (429) from server
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
      
      toast.error(`Rate limit exceeded. Retrying in ${delay / 1000} seconds...`);
      
      // Clear some requests from queue to help with rate limiting
      rateLimitConfig.requestQueue = rateLimitConfig.requestQueue.slice(-50);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiClient(originalRequest);
    }

    // Handle network errors with retry logic
    if (!error.response && !originalRequest._retry && retryCount < maxRetries) {
      originalRequest._retry = true;
      retryCount++;
      
      // Exponential backoff with jitter
      const baseDelay = config.apiRetryDelay || 1000;
      const delay = baseDelay * Math.pow(2, retryCount - 1) + Math.random() * 1000;
      
      if (config.logging.enableConsole) {
        console.log(`Retrying request (${retryCount}/${maxRetries}) after ${Math.round(delay)}ms...`);
      }
      toast.info(`Connection failed. Retrying... (${retryCount}/${maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return apiClient(originalRequest);
    }

    // Handle server errors (5xx) with retry
    if (error.response?.status && error.response.status >= 500 && !originalRequest._retry && retryCount < maxRetries) {
      originalRequest._retry = true;
      retryCount++;
      
      const baseDelay = config.apiRetryDelay || 1000;
      const delay = baseDelay * Math.pow(2, retryCount - 1);
      
      if (config.logging.enableConsole) {
        console.log(`Server error, retrying (${retryCount}/${maxRetries}) after ${delay}ms...`);
      }
      toast.error(`Server error. Retrying... (${retryCount}/${maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiClient(originalRequest);
    }

    // Reset retry count for non-retryable errors
    retryCount = 0;
    
    // Handle specific error messages
    if (!error.response) {
      (error as any).message = 'Network error. Please check your internet connection.';
      toast.error('Network error. Please check your internet connection.');
    } else if (error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response.status >= 400 && error.response.status < 500) {
      const errorMessage = error.response.data?.error || error.response.data?.message || 'Request failed';
      if (!errorMessage.includes('Session expired') && !errorMessage.includes('Access denied')) {
        toast.error(errorMessage);
      }
    }
    
    return Promise.reject(error);
  }
);

// Generic API methods
export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.get(url, config),
  
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.post(url, data, config),
  
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.put(url, data, config),
  
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.delete(url, config),
  
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.patch(url, data, config),
};

export default apiClient;