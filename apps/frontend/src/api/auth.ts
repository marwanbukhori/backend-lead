import { apiClient } from './client';
import type { User } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  async login(credentials: LoginCredentials) {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  async register(data: RegisterData) {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  async getCurrentUser() {
    return apiClient.get<User>('/auth/me');
  }
};
