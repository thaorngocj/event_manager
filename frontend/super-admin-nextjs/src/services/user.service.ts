import { apiClient } from '@/lib/api-client'

export interface UserListParams {
  page?: number
  limit?: number
  search?: string
}

export const userService = {
  getAll: async (params?: UserListParams) => {
    const { data } = await apiClient.get('/users', { params })
    return data
  },
  getOne: async (id: string) => {
    const { data } = await apiClient.get(`/users/${id}`)
    return data
  },
  create: async (payload: { username: string; email: string; password: string; role: string }) => {
    const { data } = await apiClient.post('/users/create', payload)
    return data
  },
  update: async (id: string, payload: { username?: string; email?: string; role?: string }) => {
    const { data } = await apiClient.patch(`/users/${id}`, payload)
    return data
  },
  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/users/${id}`)
    return data
  },
  changeRole: async (id: string, role: string) => {
    const { data } = await apiClient.patch(`/users/${id}/role`, { role })
    return data
  },
  deactivate: async (id: string) => {
    const { data } = await apiClient.patch(`/users/${id}/deactivate`)
    return data
  },
  activate: async (id: string) => {
    const { data } = await apiClient.patch(`/users/${id}/activate`)
    return data
  },
  updateProfile: async (payload: { username?: string; email?: string }) => {
    const { data } = await apiClient.patch('/users/me', payload)
    return data
  },
}
