/**
 * Fallback data service for when backend endpoints are not available
 * This provides mock data to keep the frontend functional during development
 */

import { ApiResponse, Article, Category, Author, Image, BreakingNews } from '../types/api';

// Mock data
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Politics',
    slug: 'politics',
    description: 'Political news and updates',
    displayOrder: 1,
    articleCount: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Sports',
    slug: 'sports',
    description: 'Sports news and events',
    displayOrder: 2,
    articleCount: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Economy',
    slug: 'economy',
    description: 'Economic news and analysis',
    displayOrder: 3,
    articleCount: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Culture',
    slug: 'culture',
    description: 'Cultural events and news',
    displayOrder: 4,
    articleCount: 6,
    createdAt: new Date().toISOString(),
  },
];

const mockAuthors: Author[] = [
  {
    id: '1',
    name: 'John Smith',
    role: 'Senior Political Reporter',
    biography: 'John has been covering Dominican politics for over 10 years.',
    email: 'john.smith@dominicanews.com',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    role: 'Sports Correspondent',
    biography: 'Maria covers sports events across the Caribbean region.',
    email: 'maria.rodriguez@dominicanews.com',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Sample Article Title',
    slug: 'sample-article-title',
    excerpt: 'This is a sample article excerpt for testing purposes.',
    content: '<p>This is sample article content.</p>',
    category: mockCategories[0],
    author: mockAuthors[0],
    status: 'published',
    publishedAt: new Date().toISOString(),
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockImages: Image[] = [
  {
    id: '1',
    filename: 'sample-image.jpg',
    originalName: 'sample-image.jpg',
    filePath: '/uploads/sample-image.jpg',
    thumbnailPath: '/uploads/thumbnails/sample-image.jpg',
    fileSize: 1024000,
    mimeType: 'image/jpeg',
    width: 1920,
    height: 1080,
    altText: 'Sample image',
    uploader: {
      id: '1',
      email: 'admin@dominicanews.com',
      fullName: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    urls: {
      original: '/uploads/sample-image.jpg',
      large: '/uploads/large/sample-image.jpg',
      medium: '/uploads/medium/sample-image.jpg',
      small: '/uploads/small/sample-image.jpg',
      thumbnail: '/uploads/thumbnails/sample-image.jpg',
      navigationThumbnail: '/uploads/nav-thumbs/sample-image.jpg',
    },
    webpUrls: {
      original: '/uploads/sample-image.webp',
      large: '/uploads/large/sample-image.webp',
      medium: '/uploads/medium/sample-image.webp',
      small: '/uploads/small/sample-image.webp',
    },
    url: '/uploads/sample-image.jpg',
    thumbnailUrl: '/uploads/thumbnails/sample-image.jpg',
    createdAt: new Date().toISOString(),
  },
];

const mockBreakingNews: BreakingNews[] = [
  {
    id: '1',
    text: 'Sample breaking news alert for testing purposes',
    isActive: true,
    createdBy: {
      id: '1',
      email: 'admin@dominicanews.com',
      fullName: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock static pages
const mockStaticPages = [
  {
    id: '1',
    title: 'About Us',
    slug: 'about-us',
    content: '<h1>About Dominica News</h1><p>Your trusted source for news in Dominica.</p>',
    metaTitle: 'About Us - Dominica News',
    metaDescription: 'Learn more about Dominica News and our mission.',
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Contact Us',
    slug: 'contact-us',
    content: '<h1>Contact Us</h1><p>Get in touch with our editorial team.</p>',
    metaTitle: 'Contact Us - Dominica News',
    metaDescription: 'Contact information for Dominica News.',
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Fallback service functions
export const fallbackService = {
  // Categories
  getCategories: (): Promise<ApiResponse<{ categories: Category[] }>> => {
    return Promise.resolve({
      success: true,
      message: 'Categories retrieved (fallback data)',
      data: { categories: mockCategories },
    });
  },

  getAdminCategories: (): Promise<ApiResponse<Category[]>> => {
    return Promise.resolve({
      success: true,
      message: 'Admin categories retrieved (fallback data)',
      data: mockCategories,
    });
  },

  // Authors
  getAuthors: (): Promise<ApiResponse<{ authors: Author[] }>> => {
    return Promise.resolve({
      success: true,
      message: 'Authors retrieved (fallback data)',
      data: { authors: mockAuthors },
    });
  },

  getAdminAuthors: (): Promise<ApiResponse<{ authors: Author[] }>> => {
    return Promise.resolve({
      success: true,
      message: 'Admin authors retrieved (fallback data)',
      data: { authors: mockAuthors },
    });
  },

  // Articles
  getArticles: (params?: any): Promise<ApiResponse<{ articles: Article[]; pagination: any }>> => {
    return Promise.resolve({
      success: true,
      message: 'Articles retrieved (fallback data)',
      data: {
        articles: mockArticles,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalArticles: mockArticles.length,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 10,
        },
      },
    });
  },

  getAdminArticles: (params?: any): Promise<ApiResponse<{ articles: Article[]; pagination: any }>> => {
    return Promise.resolve({
      success: true,
      message: 'Admin articles retrieved (fallback data)',
      data: {
        articles: mockArticles,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalArticles: mockArticles.length,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 10,
        },
      },
    });
  },

  // Images
  getImages: (params?: any): Promise<ApiResponse<{ images: Image[]; pagination: any }>> => {
    return Promise.resolve({
      success: true,
      message: 'Images retrieved (fallback data)',
      data: {
        images: mockImages,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalImages: mockImages.length,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 20,
        },
      },
    });
  },

  // Breaking News
  getBreakingNews: (): Promise<ApiResponse<{ breakingNews: BreakingNews[] }>> => {
    return Promise.resolve({
      success: true,
      message: 'Breaking news retrieved (fallback data)',
      data: { breakingNews: mockBreakingNews },
    });
  },

  // Static Pages
  getStaticPages: (published?: boolean): Promise<ApiResponse<{ data: any[]; count: number }>> => {
    const filteredPages = published ? mockStaticPages.filter(p => p.isPublished) : mockStaticPages;
    return Promise.resolve({
      success: true,
      message: 'Static pages retrieved (fallback data)',
      data: { data: filteredPages, count: filteredPages.length },
    });
  },

  // Generic fallback for any missing endpoint
  genericFallback: <T>(data: T, message: string = 'Data retrieved (fallback)'): Promise<ApiResponse<T>> => {
    return Promise.resolve({
      success: true,
      message,
      data,
    });
  },
};

// Helper function to check if we should use fallback data
export const shouldUseFallback = (error: any): boolean => {
  // Use fallback for 404 errors on admin endpoints
  if (error?.response?.status === 404 && error?.config?.url?.includes('/admin/')) {
    return true;
  }
  
  // Use fallback for network errors in development
  if (!error?.response && process.env.NODE_ENV === 'development') {
    return true;
  }
  
  return false;
};

// Enhanced service wrapper that falls back to mock data when needed
export const withFallback = <T>(
  serviceCall: () => Promise<T>,
  fallbackCall: () => Promise<T>,
  options: { enableFallback?: boolean; logFallback?: boolean } = {}
): Promise<T> => {
  const { enableFallback = true, logFallback = true } = options;
  
  return serviceCall().catch((error) => {
    if (enableFallback && shouldUseFallback(error)) {
      if (logFallback && console.warn) {
        console.warn('Using fallback data due to API error:', error.message);
      }
      return fallbackCall();
    }
    throw error;
  });
};