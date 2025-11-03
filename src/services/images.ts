import { api } from './api';
import { ApiResponse, Image, ImagesResponse } from '../types/api';

export const imagesService = {
  // Admin endpoints
  uploadImage: async (formData: FormData): Promise<ApiResponse<{ image: Image }>> => {
    const response = await api.post<ApiResponse<{ image: Image }>>(
      '/admin/images/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  getImages: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<ImagesResponse>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await api.get<ApiResponse<ImagesResponse>>(
      `/admin/images?${searchParams.toString()}`
    );
    return response.data;
  },

  getImageById: async (id: string): Promise<ApiResponse<{ image: Image }>> => {
    const response = await api.get<ApiResponse<{ image: Image }>>(`/admin/images/${id}`);
    return response.data;
  },

  deleteImage: async (id: string): Promise<ApiResponse<{}>> => {
    const response = await api.delete<ApiResponse<{}>>(`/admin/images/${id}`);
    return response.data;
  },

  // Utility functions
  getImageUrl: (filename: string): string => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${baseUrl}/images/${filename}`;
  },

  getThumbnailUrl: (filename: string): string => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${baseUrl}/images/thumbnails/thumb-${filename}`;
  },
};