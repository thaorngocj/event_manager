import axios from 'axios'
import { signOut } from 'next-auth/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.0.10.29:3000/api/v1'
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  transformResponse: [(data) => {
    if (!data || (typeof data === 'string' && data.trim() === '')) return null
    try {
      return JSON.parse(data)
    } catch {
      return data
    }
  }],
})

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

let isRefreshing = false
let isSigningOut = false
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void }[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token
          return apiClient(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        }, {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data

        localStorage.setItem('access_token', accessToken)
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken)
        }

        apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken

        processQueue(null, accessToken)
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)

        if (typeof window !== 'undefined' && !isSigningOut && window.location.pathname !== '/login') {
          isSigningOut = true
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          sessionStorage.removeItem('access_token')
          signOut({ callbackUrl: '/login' }).finally(() => { isSigningOut = false })
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
