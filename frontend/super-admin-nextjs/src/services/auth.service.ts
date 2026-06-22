import { apiClient } from '@/lib/api-client'

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password })
    return data as { accessToken: string; refreshToken: string; role: string; email: string }
  },
  refresh: async (refreshToken: string) => {
    const { data } = await apiClient.post('/auth/refresh', { refreshToken })
    return data as { accessToken: string }
  },
  getMe: async () => {
    const { data } = await apiClient.get('/users/me')
    return data as ApiUser
  },
  forgotPassword: async (email: string) => {
    const { data } = await apiClient.post('/auth/forgot-password', { email })
    return data
  },
  resetPassword: async (token: string, newPassword: string) => {
    const { data } = await apiClient.post('/auth/reset-password', { token, newPassword })
    return data
  },
}

export interface ApiUser {
  id: string
  username: string
  email: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EVENT_MANAGER' | 'STUDENT'
  active: boolean
}
