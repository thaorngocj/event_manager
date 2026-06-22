import { apiClient } from '@/lib/api-client';

export const registrationService = {
  register: async (eventId: string | number) => {
    const { data } = await apiClient.post(`/registrations/events/${eventId}/register`);
    return data;
  },
  getMyEvents: async () => {
    const { data } = await apiClient.get('/registrations/my-events');
    return data;
  },
  checkin: async (eventId: string | number, payload: Record<string, unknown>) => {
    const { data } = await apiClient.post(`/registrations/events/${eventId}/checkin`, payload);
    return data;
  },
  manualCheckin: async (eventId: string | number, email: string) => {
    const { data } = await apiClient.post(`/registrations/events/${eventId}/manual-checkin`, { email });
    return data;
  },
  cancel: async (registrationId: string | number) => {
    const { data } = await apiClient.delete(`/registrations/${registrationId}/cancel`);
    return data;
  },
};
