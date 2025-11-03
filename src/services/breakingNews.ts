import { api } from './api';
import { BreakingNews, BreakingNewsFormData, ApiResponse } from '../types/api';

export const breakingNewsService = {
  // Get active breaking news (public)
  getActive: async (): Promise<BreakingNews | null> => {
    try {
      const response = await api.get<ApiResponse<BreakingNews | null>>('/breaking-news');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching active breaking news:', error);
      return null;
    }
  },

  // Admin endpoints
  getAll: async (page = 1, limit = 10): Promise<{ breakingNews: BreakingNews[]; pagination: any }> => {
    const response = await api.get<ApiResponse<{ breakingNews: BreakingNews[]; pagination: any }>>(
      `/admin/breaking-news?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  create: async (data: BreakingNewsFormData): Promise<BreakingNews> => {
    const response = await api.post<ApiResponse<BreakingNews>>('/admin/breaking-news', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<BreakingNewsFormData>): Promise<BreakingNews> => {
    const response = await api.put<ApiResponse<BreakingNews>>(`/admin/breaking-news/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/breaking-news/${id}`);
  },
};