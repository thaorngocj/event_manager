import { apiClient } from '@/lib/api-client'

export const registrationService = {
  register: async (eventId: string) => {
    const { data } = await apiClient.post(`/registrations/events/${eventId}/register`)
    return data
  },
  checkin: async (eventId: string, qrData: string) => {
    const { data } = await apiClient.post(`/registrations/events/${eventId}/checkin`, { qrData })
    return data
  },
  manualCheckin: async (eventId: string, payload: Record<string, unknown>) => {
    const { data } = await apiClient.post(`/registrations/events/${eventId}/manual-checkin`, payload)
    return data
  },
  getMyEvents: async () => {
    const { data } = await apiClient.get('/registrations/my-events')
    return data
  },
  cancel: async (id: string) => {
    const { data } = await apiClient.delete(`/registrations/${id}/cancel`)
    return data
  },
}
