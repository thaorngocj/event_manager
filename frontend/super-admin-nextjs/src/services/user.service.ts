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
  create: async (payload: {
    username: string; email: string; password: string; role: string
    mssv?: string; facultyId?: number; major?: string; cohort?: string; classId?: string
    trainingPoints?: number; unionRole?: string
  }) => {
    const { data } = await apiClient.post('/users/create', payload)
    return data
  },
  update: async (id: string, payload: { username?: string; email?: string; role?: string; mssv?: string; trainingPoints?: number; unionRole?: string }) => {
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
  downloadImportTemplate: async () => {
    const response = await apiClient.get('/users/import/template', { responseType: 'blob' })
    return response
  },
  importUsers: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await apiClient.post('/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}
