import { api } from './api';
import { ApiResponse } from '../types/api';
import { withFallback, fallbackService } from './fallbackData';

export interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaticPagesResponse {
  data: StaticPage[];
  count: number;
}

export interface StaticPageFormData {
  title: string;
  slug?: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished?: boolean;
}

export const staticPagesService = {
  // Get static page by slug (public)
  getPageBySlug: async (slug: string): Promise<ApiResponse<StaticPage>> => {
    const response = await api.get(`/pages/${slug}`);
    return response.data;
  },

  // Get all static pages (admin)
  getAdminPages: async (published?: boolean): Promise<ApiResponse<StaticPagesResponse>> => {
    return withFallback(
      async () => {
        const params = published !== undefined ? { published: published.toString() } : {};
        const response = await api.get('/admin/pages', { params });
        return response.data;
      },
      () => fallbackService.getStaticPages(published)
    );
  },

  // Get page by ID (admin)
  getPageById: async (id: string): Promise<ApiResponse<StaticPage>> => {
    const response = await api.get(`/admin/pages/${id}`);
    return response.data;
  },

  // Create new static page
  createPage: async (data: StaticPageFormData): Promise<ApiResponse<StaticPage>> => {
    const response = await api.post('/admin/pages', data);
    return response.data;
  },

  // Update static page
  updatePage: async (id: string, data: Partial<StaticPageFormData>): Promise<ApiResponse<StaticPage>> => {
    const response = await api.put(`/admin/pages/${id}`, data);
    return response.data;
  },

  // Delete static page
  deletePage: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/admin/pages/${id}`);
    return response.data;
  },

  // Get Editorial Team page (public)
  getEditorialTeamPage: async (): Promise<ApiResponse<StaticPage & { authors: any[] }>> => {
    const response = await api.get('/pages/editorial-team');
    return response.data;
  },
};