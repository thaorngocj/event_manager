import { apiClient } from '@/lib/api-client';

export const authService = {
  login: async (payload: Record<string, unknown>) => {
    const { data } = await apiClient.post('/auth/login', payload);
    if (data.accessToken) {
      localStorage.setItem('access_token', data.accessToken);
    }
    if (data.refreshToken) {
      localStorage.setItem('refresh_token', data.refreshToken);
    }
    return data;
  },
  refresh: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token');
    const { data } = await apiClient.post('/auth/refresh', { refreshToken });
    if (data.accessToken) {
      localStorage.setItem('access_token', data.accessToken);
    }
    return data;
  },
  getMe: async () => {
    const { data } = await apiClient.get('/users/me');
    return data;
  },
  forgotPassword: async (email: string) => {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data;
  },
  resetPassword: async (token: string, newPassword: string) => {
    const { data } = await apiClient.post('/auth/reset-password', { token, newPassword });
    return data;
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
