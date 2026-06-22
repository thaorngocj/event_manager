import { apiClient } from '@/lib/api-client'

export interface CreateEventPayload {
  title: string
  description: string
  location?: string
  imageUrl?: string
  bannerUrl?: string
  startDate: string
  endDate: string
  maxParticipants?: number
  displayCategory?: 'HERO' | 'FEATURED' | 'HIGHLIGHT' | 'NORMAL'
  eventCategory?: string
}

export const eventService = {
  getAll: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get('/events', { params })
    return data
  },
  getOne: async (id: string) => {
    const { data } = await apiClient.get(`/events/${id}`)
    return data
  },
  create: async (payload: CreateEventPayload) => {
    const { data } = await apiClient.post('/events', payload)
    return data
  },
  update: async (id: string, payload: Partial<CreateEventPayload>) => {
    const { data } = await apiClient.patch(`/events/${id}`, payload)
    return data
  },
  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/events/${id}`)
    return data
  },
  getCalendar: async () => {
    const { data } = await apiClient.get('/events/calendar')
    return data
  },
  getRegistrations: async (id: string) => {
    const { data } = await apiClient.get(`/events/${id}/registrations`)
    return data
  },
  exportList: async (id: string) => {
    const { data } = await apiClient.get(`/events/${id}/export`, { responseType: 'blob' })
    return data
  },
  importAttendees: async (id: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post(`/events/${id}/import`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
  getImportHistory: async (id: string) => {
    const { data } = await apiClient.get(`/events/${id}/import-history`)
    return data
  },
  downloadImportTemplate: async () => {
    const response = await apiClient.get('/events/import-template', { responseType: 'blob' })
    return response.data
  },
  downloadImportEventsTemplate: async () => {
    const response = await apiClient.get('/events/import-template-events', { responseType: 'blob' })
    return response.data
  },
  bulkImportEvents: async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post('/events/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}
