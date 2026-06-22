import { apiClient } from '@/lib/api-client';

export const eventService = {
  getAll: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get('/events', { params });
    return data;
  },
  getOne: async (id: string | number) => {
    const { data } = await apiClient.get(`/events/${id}`);
    return data;
  },
  getBySlug: async (slug: string) => {
    const { data } = await apiClient.get(`/events/slug/${slug}`);
    return data;
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await apiClient.post('/events', payload);
    return data;
  },
  update: async (id: string | number, payload: Record<string, unknown>) => {
    const { data } = await apiClient.patch(`/events/${id}`, payload);
    return data;
  },
  delete: async (id: string | number) => {
    const { data } = await apiClient.delete(`/events/${id}`);
    return data;
  },
  getRegistrations: async (id: string | number) => {
    const { data } = await apiClient.get(`/events/${id}/registrations`);
    return data;
  },
  exportParticipants: (id: string | number) => {
    window.open(`/api/proxy/events/${id}/export`, '_blank');
  },
  importEvents: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/events/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  downloadImportTemplate: () => {
    window.open('/api/proxy/events/import-template', '_blank');
  },
  downloadEventImportTemplate: () => {
    window.open('/api/proxy/events/import-template-events', '_blank');
  },
};
