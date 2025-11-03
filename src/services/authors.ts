import { api } from './api';
import { ApiResponse, Author } from '../types/api';

export interface AuthorsResponse {
  authors: Author[];
  count: number;
}

export interface AuthorFormData {
  name: string;
  role: string;
  biography?: string;
  profileImage?: string;
  email: string;
  isActive?: boolean;
}

export const authorsService = {
  // Get all active authors (public)
  getAuthors: async (): Promise<ApiResponse<AuthorsResponse>> => {
    const response = await api.get('/authors');
    return response.data;
  },

  // Get all authors (admin)
  getAdminAuthors: async (): Promise<ApiResponse<AuthorsResponse>> => {
    const response = await api.get('/admin/authors');
    return response.data;
  },

  // Get author by ID
  getAuthorById: async (id: string): Promise<ApiResponse<{ author: Author }>> => {
    const response = await api.get(`/admin/authors/${id}`);
    return response.data;
  },

  // Create new author
  createAuthor: async (data: AuthorFormData): Promise<ApiResponse<{ author: Author }>> => {
    const response = await api.post('/admin/authors', data);
    return response.data;
  },

  // Update author
  updateAuthor: async (id: string, data: Partial<AuthorFormData>): Promise<ApiResponse<{ author: Author }>> => {
    const response = await api.put(`/admin/authors/${id}`, data);
    return response.data;
  },

  // Delete author
  deleteAuthor: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/admin/authors/${id}`);
    return response.data;
  },
};