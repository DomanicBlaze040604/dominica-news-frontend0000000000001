import { ApiResponse } from '../types/api';

export interface SiteSetting {
  _id: string;
  key: string;
  value: string;
  description?: string;
  updatedBy?: string;
  updatedAt: string;
}

export interface SiteSettingsResponse {
  settings: SiteSetting[];
}

class SiteSettingsService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  async getSetting(key: string): Promise<ApiResponse<SiteSetting>> {
    const response = await fetch(`${this.baseUrl}/settings/${key}`);
    return response.json();
  }

  async getAllSettings(): Promise<ApiResponse<SiteSettingsResponse>> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/admin/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  async updateSetting(key: string, value: string, description?: string): Promise<ApiResponse<SiteSetting>> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/admin/settings/${key}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value, description }),
    });
    return response.json();
  }

  async deleteSetting(key: string): Promise<ApiResponse<null>> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/admin/settings/${key}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }
}

export const siteSettingsService = new SiteSettingsService();