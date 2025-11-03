// Common API response structure
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

// Pagination structure
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  totalArticles?: number;
  totalImages?: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

// User types
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt?: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  articleCount?: number;
  createdAt: string;
}

// Author types
export interface Author {
  id: string;
  name: string;
  role: string;
  biography?: string;
  profileImage?: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Article types
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  featuredImageAlt?: string; // Alt text for featured image
  category: Category;
  author: Author;
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: string;
  scheduledAt?: string;
  isPinned: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

// Image types
export interface Image {
  id: string;
  filename: string;
  originalName: string;
  filePath: string;
  thumbnailPath: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  altText: string;
  uploader: User;
  // Enhanced URLs for different sizes
  urls: {
    original: string;
    large: string;
    medium: string;
    small: string;
    thumbnail: string;
    navigationThumbnail: string;
  };
  webpUrls: {
    original: string;
    large: string;
    medium: string;
    small: string;
  };
  // Legacy URLs for backward compatibility
  url: string;
  thumbnailUrl: string;
  createdAt: string;
}

// Breaking News types
export interface BreakingNews {
  id: string;
  text: string;
  isActive: boolean;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface BreakingNewsFormData {
  text: string;
  isActive?: boolean;
}

export interface BreakingNewsResponse {
  breakingNews: BreakingNews[];
  pagination?: Pagination;
}

// Form data types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export interface ArticleFormData {
  title: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  categoryId: string;
  authorId?: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduledAt?: string;
  isPinned?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  displayOrder?: number;
}

// API response types
export interface ArticlesResponse {
  articles: Article[];
  pagination: Pagination;
}

export interface CategoriesResponse {
  categories: Category[];
  count: number;
}

export interface ImagesResponse {
  images: Image[];
  pagination: Pagination;
}

export interface AuthResponse {
  user: User;
  token: string;
}