/**
 * Admin error recovery utilities
 * Provides graceful degradation and recovery for admin panel features
 */

import { toast } from 'sonner';
import { fallbackService } from '../services/fallbackData';

export interface ErrorRecoveryOptions {
  showToast?: boolean;
  fallbackMessage?: string;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Wrap admin service calls with error recovery
 */
export async function withAdminErrorRecovery<T>(
  serviceCall: () => Promise<T>,
  fallbackCall?: () => Promise<T>,
  options: ErrorRecoveryOptions = {}
): Promise<T> {
  const {
    showToast = true,
    fallbackMessage = 'Using offline data while backend is unavailable',
    retryAttempts = 1,
    retryDelay = 1000,
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= retryAttempts; attempt++) {
    try {
      return await serviceCall();
    } catch (error: any) {
      lastError = error;
      
      // If this is not the last attempt, wait and retry
      if (attempt < retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }

      // Handle different error types
      if (error?.response?.status === 404 && fallbackCall) {
        if (showToast) {
          toast.info(fallbackMessage);
        }
        console.warn('Admin endpoint not available, using fallback data:', error.config?.url);
        return await fallbackCall();
      }

      if (error?.response?.status === 429) {
        if (showToast) {
          toast.warning('Too many requests. Please wait a moment and try again.');
        }
        throw error;
      }

      if (error?.response?.status >= 500) {
        if (showToast) {
          toast.error('Server error. Please try again later.');
        }
        throw error;
      }

      if (!error?.response) {
        if (showToast) {
          toast.error('Network error. Please check your connection.');
        }
        throw error;
      }

      // For other errors, just throw
      throw error;
    }
  }

  throw lastError;
}

/**
 * Create a mock response for admin endpoints
 */
export function createMockAdminResponse<T>(data: T, message: string = 'Mock data'): Promise<{ data: T; success: boolean; message: string }> {
  return Promise.resolve({
    data,
    success: true,
    message,
  });
}

/**
 * Check if admin features should use fallback mode
 */
export function shouldUseFallbackMode(): boolean {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    return true;
  }

  // Check if backend is available (you could implement a health check here)
  return false;
}

/**
 * Admin feature availability checker
 */
export const adminFeatures = {
  articles: {
    available: true,
    fallbackAvailable: true,
    message: 'Article management is available with limited functionality',
  },
  categories: {
    available: true,
    fallbackAvailable: true,
    message: 'Category management is fully functional',
  },
  authors: {
    available: true,
    fallbackAvailable: true,
    message: 'Author management is available with sample data',
  },
  images: {
    available: false,
    fallbackAvailable: true,
    message: 'Image upload is not available. Using sample images.',
  },
  breakingNews: {
    available: true,
    fallbackAvailable: true,
    message: 'Breaking news management is available with sample data',
  },
  staticPages: {
    available: true,
    fallbackAvailable: true,
    message: 'Static page management is available with sample data',
  },
  settings: {
    available: true,
    fallbackAvailable: false,
    message: 'Settings management requires backend connection',
  },
};

/**
 * Get feature status
 */
export function getFeatureStatus(feature: keyof typeof adminFeatures) {
  return adminFeatures[feature];
}

/**
 * Display feature status to user
 */
export function showFeatureStatus(feature: keyof typeof adminFeatures) {
  const status = getFeatureStatus(feature);
  
  if (!status.available && status.fallbackAvailable) {
    toast.info(status.message);
  } else if (!status.available && !status.fallbackAvailable) {
    toast.error(`${feature} is not available. ${status.message}`);
  }
}

/**
 * Enhanced error boundary for admin components
 */
export class AdminErrorBoundary extends Error {
  constructor(
    message: string,
    public feature: string,
    public recoverable: boolean = true,
    public fallbackAvailable: boolean = true
  ) {
    super(message);
    this.name = 'AdminErrorBoundary';
  }
}

/**
 * Graceful degradation for admin operations
 */
export async function gracefulAdminOperation<T>(
  operation: () => Promise<T>,
  feature: keyof typeof adminFeatures,
  fallback?: () => Promise<T>
): Promise<T> {
  const featureStatus = getFeatureStatus(feature);
  
  try {
    return await operation();
  } catch (error: any) {
    console.warn(`Admin operation failed for ${feature}:`, error);
    
    if (fallback && featureStatus.fallbackAvailable) {
      toast.info(`${feature} is running in offline mode`);
      return await fallback();
    }
    
    if (!featureStatus.available) {
      toast.error(`${feature} is currently unavailable`);
      throw new AdminErrorBoundary(
        `${feature} is not available`,
        feature,
        featureStatus.fallbackAvailable,
        featureStatus.fallbackAvailable
      );
    }
    
    throw error;
  }
}