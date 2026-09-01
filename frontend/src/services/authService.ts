import { apiClient } from '@/api/client';
import { User, Address } from '@/types';

export const authService = {
  async register(payload: { email: string; password: string; full_name: string; phone?: string }) {
    const { data } = await apiClient.post<{ access_token: string; token_type: string; user: User }>('/auth/register', payload);
    return data;
  },

  async login(payload: { email: string; password: string }) {
    const { data } = await apiClient.post<{ access_token: string; token_type: string; user: User }>('/auth/login', payload);
    return data;
  },

  async googleLogin(payload: { token?: string; email?: string; name?: string }) {
    const { data } = await apiClient.post<{ access_token: string; token_type: string; user: User }>('/auth/google', payload);
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },

  async updateProfile(payload: { full_name?: string; phone?: string }): Promise<User> {
    const { data } = await apiClient.put<User>('/auth/profile', payload);
    return data;
  },

  async changePassword(payload: { current_password: string; new_password: string }) {
    const { data } = await apiClient.post('/auth/change-password', payload);
    return data;
  },

  async getAddresses(): Promise<Address[]> {
    const { data } = await apiClient.get<Address[]>('/auth/addresses');
    return data;
  },

  async addAddress(payload: Omit<Address, 'id' | 'user_id' | 'created_at'>): Promise<Address> {
    const { data } = await apiClient.post<Address>('/auth/address', payload);
    return data;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.post<{ success: boolean; message: string }>('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(payload: { token: string; new_password: string }): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.post<{ success: boolean; message: string }>('/auth/reset-password', payload);
    return data;
  }
};

