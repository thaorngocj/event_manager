'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'
import { UserRole, UserProfile } from '@/types'

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  signIn: (email?: string, password?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [createdAt] = useState(() => Date.now())

  const loading = status === 'loading'

  const user: UserProfile | null = session?.user
    ? {
        uid: session.user.uid || session.user.email || '',
        email: session.user.email || '',
        displayName: session.user.name || '',
        role: (session.user.role as UserRole) || UserRole.STUDENT,
        schoolId: session.user.schoolId,
        createdAt,
      }
    : null

  useEffect(() => {
    if (session?.user?.accessToken) {
      localStorage.setItem('access_token', session.user.accessToken)
      if (session.user.refreshToken) {
        localStorage.setItem('refresh_token', session.user.refreshToken)
      }
    } else if (status === 'unauthenticated') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }, [session?.user?.accessToken, session?.user?.refreshToken, status])

  const signIn = async (email?: string, password?: string) => {
    const result = await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
    })
    if (result?.error) {
      throw new Error('Login failed. Please check your credentials.')
    }
    // Force session reload before returning
    window.location.href = '/dashboard'
  }

  const signOut = async () => {
    localStorage.removeItem('access_token')
    await nextAuthSignOut({ redirect: false })
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
