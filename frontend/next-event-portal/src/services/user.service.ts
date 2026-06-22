import { apiClient } from '@/lib/api-client';

export const userService = {
  getAll: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get('/users', { params });
    return data;
  },
  getOne: async (id: string | number) => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await apiClient.post('/users/create', payload);
    return data;
  },
  update: async (id: string | number, payload: Record<string, unknown>) => {
    const { data } = await apiClient.patch(`/users/${id}`, payload);
    return data;
  },
  delete: async (id: string | number) => {
    const { data } = await apiClient.delete(`/users/${id}`);
    return data;
  },
  updateRole: async (id: string | number, payload: { role: string }) => {
    const { data } = await apiClient.patch(`/users/${id}/role`, payload);
    return data;
  },
  updateProfile: async (payload: Record<string, unknown>) => {
    const { data } = await apiClient.patch('/users/me', payload);
    return data;
  },
  activate: async (id: string | number) => {
    const { data } = await apiClient.patch(`/users/${id}/activate`);
    return data;
  },
  deactivate: async (id: string | number) => {
    const { data } = await apiClient.patch(`/users/${id}/deactivate`);
    return data;
  },
};
