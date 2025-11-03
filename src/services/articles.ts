import { api } from './api';
import { ApiResponse, Article, ArticlesResponse, ArticleFormData } from '../types/api';

export const articlesService = {
  // Public endpoints
  getPublishedArticles: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<ApiResponse<ArticlesResponse>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);

    const response = await api.get<ApiResponse<ArticlesResponse>>(
      `/articles?${searchParams.toString()}`
    );
    return response.data;
  },

  getArticleBySlug: async (slug: string): Promise<ApiResponse<{ article: Article }>> => {
    const response = await api.get<ApiResponse<{ article: Article }>>(`/articles/${slug}`);
    return response.data;
  },

  getRelatedArticles: async (slug: string, limit?: number): Promise<ApiResponse<{ articles: Article[]; count: number }>> => {
    const searchParams = new URLSearchParams();
    if (limit) searchParams.append('limit', limit.toString());

    const response = await api.get<ApiResponse<{ articles: Article[]; count: number }>>(
      `/articles/${slug}/related?${searchParams.toString()}`
    );
    return response.data;
  },

  getCategoryArticles: async (
    categorySlug: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<ArticlesResponse & { category: any }>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await api.get<ApiResponse<ArticlesResponse & { category: any }>>(
      `/articles/category/${categorySlug}?${searchParams.toString()}`
    );
    return response.data;
  },

  getPinnedArticles: async (limit?: number): Promise<ApiResponse<{ articles: Article[]; count: number }>> => {
    const searchParams = new URLSearchParams();
    if (limit) searchParams.append('limit', limit.toString());

    const response = await api.get<ApiResponse<{ articles: Article[]; count: number }>>(
      `/articles/pinned?${searchParams.toString()}`
    );
    return response.data;
  },

  getLatestArticles: async (params?: {
    limit?: number;
    excludePinned?: boolean;
  }): Promise<ApiResponse<{ articles: Article[]; count: number }>> => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.excludePinned) searchParams.append('excludePinned', 'true');

    const response = await api.get<ApiResponse<{ articles: Article[]; count: number }>>(
      `/articles/latest?${searchParams.toString()}`
    );
    return response.data;
  },

  // Admin endpoints
  getAdminArticles: async (params?: {
    page?: number;
    limit?: number;
    status?: 'draft' | 'published';
    category?: string;
  }): Promise<ApiResponse<ArticlesResponse>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.category) searchParams.append('category', params.category);

    const response = await api.get<ApiResponse<ArticlesResponse>>(
      `/admin/articles?${searchParams.toString()}`
    );
    return response.data;
  },

  getAdminArticleById: async (id: string): Promise<ApiResponse<{ article: Article }>> => {
    const response = await api.get<ApiResponse<{ article: Article }>>(`/admin/articles/${id}`);
    return response.data;
  },

  createArticle: async (articleData: ArticleFormData): Promise<ApiResponse<{ article: Article }>> => {
    const response = await api.post<ApiResponse<{ article: Article }>>('/admin/articles', articleData);
    return response.data;
  },

  updateArticle: async (id: string, articleData: Partial<ArticleFormData>): Promise<ApiResponse<{ article: Article }>> => {
    const response = await api.put<ApiResponse<{ article: Article }>>(`/admin/articles/${id}`, articleData);
    return response.data;
  },

  deleteArticle: async (id: string): Promise<ApiResponse<{}>> => {
    const response = await api.delete<ApiResponse<{}>>(`/admin/articles/${id}`);
    return response.data;
  },
};