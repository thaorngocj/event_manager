import { apiClient } from '@/lib/api-client'

export interface Faculty {
  id: string
  code: string
  name: string
  description?: string
  createdAt?: string
}

export interface CreateFacultyPayload {
  code?: string
  name: string
  description?: string
}

export const facultyService = {
  getAll: async () => {
    const { data } = await apiClient.get('/faculties')
    return data
  },
  getOne: async (id: string) => {
    const { data } = await apiClient.get(`/faculties/${id}`)
    return data
  },
  create: async (payload: CreateFacultyPayload) => {
    const { data } = await apiClient.post('/faculties', payload)
    return data
  },
  update: async (id: string, payload: Partial<CreateFacultyPayload>) => {
    const { data } = await apiClient.patch(`/faculties/${id}`, payload)
    return data
  },
  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/faculties/${id}`)
    return data
  },
}
