'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Layout } from '@/components/layout/Layout'

// These routes in the dashboard group are publicly viewable without login
const PUBLIC_ROUTES = ['/events', '/calendar']

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  useEffect(() => {
    if (!loading && !user && !isPublicRoute) {
      router.push('/login')
    }
  }, [user, loading, router, isPublicRoute])

  // For public routes: always render, no auth check needed
  // For protected routes: show spinner until auth resolves
  if (!isPublicRoute && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <Layout>{children}</Layout>
}
