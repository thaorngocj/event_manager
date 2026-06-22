"use client"

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authService } from '@/services/auth.service'

interface AuthUser {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  rememberMe: boolean
  accessToken: string | null
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>
  logout: () => void
}

const DEMO_ACCOUNTS: Record<string, AuthUser> = {
  'voly@university.edu.vn': { id: 'u0', name: 'Võ Ly', email: 'voly@university.edu.vn', role: 'SUPER_ADMIN', avatar: 'https://github.com/shadcn.png' },
  'admin@university.edu.vn': { id: 'u1', name: 'Quản trị viên Hệ thống', email: 'admin@university.edu.vn', role: 'ADMIN', avatar: 'https://github.com/shadcn.png' },
}

function saveToken(token: string, remember: boolean) {
  if (typeof window === 'undefined') return
  // Luôn lưu vào sessionStorage để dùng trong tab hiện tại
  sessionStorage.setItem('access_token', token)
  if (remember) {
    // Ghi nhớ đăng nhập: lưu thêm vào localStorage
    localStorage.setItem('access_token', token)
  } else {
    localStorage.removeItem('access_token')
  }
}

function clearToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('access_token')
  sessionStorage.removeItem('access_token')
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      rememberMe: false,
      accessToken: null,
      login: async (email, password, remember = false) => {
        try {
          const res = await authService.login(email, password)
          // Backend trả về { accessToken, refreshToken, role, email }
          saveToken(res.accessToken, remember)
          const profile = await authService.getMe()
          if (profile.role !== 'SUPER_ADMIN') {
            throw new Error('UNAUTHORIZED_ROLE')
          }
          const user: AuthUser = {
            id: String(profile.id),
            name: profile.username,
            email: profile.email,
            role: profile.role,
            avatar: 'https://github.com/shadcn.png',
          }
          set({ user, isAuthenticated: true, rememberMe: remember, accessToken: res.accessToken })
          return true
        } catch (error: any) {
          console.error("Login failed:", error)
          if (error?.message === 'UNAUTHORIZED_ROLE') {
            throw new Error('Tài khoản này không có quyền Super Admin.')
          }
          throw new Error('Tài khoản hoặc mật khẩu không chính xác. Vui lòng thử lại.')
        }
      },
      logout: () => {
        clearToken()
        localStorage.removeItem('auth-storage')
        sessionStorage.removeItem('auth-storage')
        set({ user: null, isAuthenticated: false, rememberMe: false, accessToken: null })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
        }
        return {
          getItem: (name: string) =>
            localStorage.getItem(name) ?? sessionStorage.getItem(name),
          setItem: (name: string, value: string) => {
            try {
              const parsed = JSON.parse(value)
              if (parsed?.state?.rememberMe) {
                localStorage.setItem(name, value)
                sessionStorage.removeItem(name)
              } else {
                sessionStorage.setItem(name, value)
                localStorage.removeItem(name)
              }
            } catch {
              sessionStorage.setItem(name, value)
            }
          },
          removeItem: (name: string) => {
            localStorage.removeItem(name)
            sessionStorage.removeItem(name)
          },
        }
      }),
    }
  )
)
