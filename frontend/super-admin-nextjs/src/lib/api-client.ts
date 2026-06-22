import axios from 'axios'

// // Dùng proxy của Next.js để tránh CORS/ngrok warning
// const API_URL = typeof window !== 'undefined'
//   ? '/api/proxy'
//   : (process.env.NEXT_PUBLIC_API_URL || 'http://3000/api/v1')
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.0.10.29:3000/api/v1'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
})

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLoginEndpoint = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && typeof window !== 'undefined' && !isLoginEndpoint) {
      const hasToken = !!(localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))
      // Chỉ logout nếu có token thật nhưng backend từ chối (token hết hạn)
      if (hasToken && window.location.pathname !== '/login') {
        localStorage.removeItem('access_token')
        sessionStorage.removeItem('access_token')
        localStorage.removeItem('auth-storage')
        sessionStorage.removeItem('auth-storage')
        window.location.replace('/login')
      }
    }
    return Promise.reject(error)
  }
)
