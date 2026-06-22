import { apiClient } from '@/lib/api-client';

export interface OverviewStats {
  totalEvents: number;
  totalStudents: number;
  totalRegistrations: number;
  totalCheckins: number;
  checkinRate: number | string;
}

export const statisticsService = {
  getOverview: async (): Promise<OverviewStats> => {
    const { data } = await apiClient.get('/statistics/overview');
    return data;
  },
  getEventStats: async (eventId: string | number) => {
    const { data } = await apiClient.get(`/statistics/events/${eventId}`);
    return data;
  },
};
