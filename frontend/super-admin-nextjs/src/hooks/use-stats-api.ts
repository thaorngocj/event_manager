"use client"

import { useQuery } from '@tanstack/react-query'
import { statisticsService } from '@/services/statistics.service'

export function useOverviewStats() {
  return useQuery({
    queryKey: ['statistics', 'overview'],
    queryFn: async () => {
      try {
        const data = await statisticsService.getOverview()
        return {
          totalUsers: data.totalUsers ?? data.totalStudents ?? 0,
          totalEvents: data.totalEvents ?? 0,
          totalCheckins: data.totalCheckins ?? 0,
          checkInRate: parseFloat(String(data.checkinRate ?? data.checkInRate ?? 0)),
          totalRegistrations: data.totalRegistrations ?? 0,
        }
      } catch {
        return { totalUsers: 0, totalEvents: 0, totalCheckins: 0, checkInRate: 0, totalRegistrations: 0 }
      }
    },
  })
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Hôm qua'
  return `${days} ngày trước`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN')
}

export function useActivities(limit = 20) {
  return useQuery({
    queryKey: ['activities', limit],
    queryFn: async () => {
      try {
        const { data } = await import('@/lib/api-client').then(m =>
          m.apiClient.get('/activities', { params: { limit } })
        )
        const list = Array.isArray(data) ? data : (data?.data ?? data?.items ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return list.map((a: any) => ({
          user: (a.user && typeof a.user === 'object' ? (a.user.username || a.user.email) : a.user) || a.username || a.name || a.actor || 'N/A',
          action: a.action ?? a.description ?? a.message ?? a.content ?? '',
          time: a.createdAt ? formatRelativeTime(a.createdAt) : (a.time ?? ''),
          date: a.createdAt ? formatDate(a.createdAt) : (a.date ?? ''),
        }))
      } catch {
        return []
      }
    },
    refetchInterval: 30000,
  })
}

export function useTopStudents() {
  return useQuery({
    queryKey: ['statistics', 'top-students'],
    queryFn: async () => {
      try {
        const data = await statisticsService.getTopStudents()
        return Array.isArray(data) ? data : (data?.data ?? [])
      } catch {
        return []
      }
    },
  })
}

export function useEventsByCategoryMonth() {
  return useQuery({
    queryKey: ['statistics', 'events-by-category-month'],
    queryFn: async () => {
      try {
        const data = await statisticsService.getEventsByCategoryMonth()
        const list: Array<Record<string, unknown>> = Array.isArray(data) ? data : (data?.data ?? [])
        if (!list.length) return []
        // Aggregate total events per month: { name: 'T1', count: total }
        const monthMap: Record<string, number> = {}
        list.forEach((item) => {
          const month = Number(item.month ?? 0)
          const count = Number(item.count ?? 0)
          const key = `T${month}`
          monthMap[key] = (monthMap[key] ?? 0) + count
        })
        return Object.entries(monthMap)
          .sort(([a], [b]) => Number(a.slice(1)) - Number(b.slice(1)))
          .map(([name, count]) => ({ name, count }))
      } catch {
        return []
      }
    },
  })
}

export function useRegistrationsByCategory() {
  return useQuery({
    queryKey: ['statistics', 'registrations-by-category'],
    queryFn: async () => {
      try {
        const data = await statisticsService.getRegistrationsByCategory()
        const list: Array<Record<string, unknown>> = Array.isArray(data) ? data : (data?.data ?? [])
        return list.map((item) => ({
          name: String(item.category ?? item.eventCategory ?? (item.name as string) ?? 'Khác'),
          value: Number(item.count ?? item.total ?? item.value ?? 0),
        }))
      } catch {
        return []
      }
    },
  })
}
