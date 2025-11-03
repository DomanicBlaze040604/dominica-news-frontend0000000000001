import { api } from './api';
import { ApiResponse, Category, CategoriesResponse, CategoryFormData } from '../types/api';

export const categoriesService = {
  // Public endpoints
  getCategories: async (): Promise<ApiResponse<CategoriesResponse>> => {
    const response = await api.get<ApiResponse<CategoriesResponse>>('/categories');
    return response.data;
  },

  getCategoryBySlug: async (slug: string): Promise<ApiResponse<{ category: Category }>> => {
    const response = await api.get<ApiResponse<{ category: Category }>>(`/categories/${slug}`);
    return response.data;
  },

  getCategoryPreview: async (slug: string, limit: number = 5): Promise<ApiResponse<{ category: Category; articles: any[]; count: number }>> => {
    const response = await api.get<ApiResponse<{ category: Category; articles: any[]; count: number }>>(`/categories/${slug}/preview?limit=${limit}`);
    return response.data;
  },

  // Admin endpoints
  createCategory: async (categoryData: CategoryFormData): Promise<ApiResponse<{ category: Category }>> => {
    const response = await api.post<ApiResponse<{ category: Category }>>('/admin/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id: string, categoryData: Partial<CategoryFormData>): Promise<ApiResponse<{ category: Category }>> => {
    const response = await api.put<ApiResponse<{ category: Category }>>(`/admin/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<ApiResponse<{}>> => {
    const response = await api.delete<ApiResponse<{}>>(`/admin/categories/${id}`);
    return response.data;
  },
};