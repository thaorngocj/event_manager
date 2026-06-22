import { apiClient } from '@/lib/api-client'

export const statisticsService = {
  getOverview: async () => {
    const { data } = await apiClient.get('/statistics/overview')
    return data
  },
  getEventStats: async (eventId: string) => {
    const { data } = await apiClient.get(`/statistics/events/${eventId}`)
    return data
  },
  getTopStudents: async () => {
    const { data } = await apiClient.get('/statistics/students/top')
    return data
  },
  getEventsByCategoryMonth: async () => {
    const { data } = await apiClient.get('/statistics/events-by-category-month')
    return data
  },
  getRegistrationsByCategory: async () => {
    const { data } = await apiClient.get('/statistics/registrations-by-category')
    return data
  },
}
