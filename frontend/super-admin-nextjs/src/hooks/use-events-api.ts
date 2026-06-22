"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventService, CreateEventPayload } from '@/services/event.service'


const API_STATUS_MAP: Record<string, 'SẮP DIỄN RA' | 'ĐANG DIỄN RA' | 'ĐÃ KẾT THÚC' | 'ĐÃ HỦY'> = {
  DRAFT: 'SẮP DIỄN RA',
  UPCOMING: 'SẮP DIỄN RA',
  OPEN: 'SẮP DIỄN RA',
  ONGOING: 'ĐANG DIỄN RA',
  CLOSED: 'ĐÃ KẾT THÚC',
  CANCELLED: 'ĐÃ HỦY',
}

function toUiEvent(e: Record<string, unknown>) {
  return {
    id: String(e.id),
    title: (e.title as string) ?? '',
    description: (e.description as string) ?? '',
    location: (e.location as string) ?? '',
    date: e.startDate ? new Date(e.startDate as string).toLocaleDateString('vi-VN') : '',
    status: (API_STATUS_MAP[e.status as string] ?? 'SẮP DIỄN RA') as 'SẮP DIỄN RA' | 'ĐANG DIỄN RA' | 'ĐÃ KẾT THÚC' | 'ĐÃ HỦY',
    imageUrl: (e.imageUrl as string) || (e.bannerUrl as string) || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop',
    capacity: (e.maxParticipants as number) ?? 0,
    registeredCount: (e.registrationCount as number) ?? (e.registeredCount as number) ?? (e.registered as number) ?? 0,
    startDate: (e.startDate as string) ?? '',
    endDate: (e.endDate as string) ?? '',
    displayCategory: (e.displayCategory as 'HERO' | 'FEATURED' | 'HIGHLIGHT' | 'NORMAL') ?? 'NORMAL',
    eventCategory: (e.eventCategory as string) ?? '',
  }
}

export function useEventsQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: async () => {
      try {
        const response = await eventService.getAll(params)
        const list: Record<string, unknown>[] = Array.isArray(response) ? response : (response?.data ?? response?.items ?? [])
        return {
          data: list.map(toUiEvent),
          total: response?.total ?? list.length,
          page: response?.page ?? 1,
          limit: response?.limit ?? list.length,
          totalPages: response?.totalPages ?? 1,
        }
      } catch (error) {
        console.error("Failed to load events:", error);
        return { data: [], total: 0, page: 1, limit: 10, totalPages: 1 };
      }
    },
  })
}

export function useEventQuery(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      try {
        const data = await eventService.getOne(id)
        return toUiEvent(data)
      } catch (error) {
        console.error("Failed to load event:", error);
        return null;
      }
    },
    enabled: !!id,
  })
}

export function useEventRegistrationsQuery(eventId: string) {
  return useQuery({
    queryKey: ['events', eventId, 'registrations'],
    queryFn: async () => {
      const data = await eventService.getRegistrations(eventId)
      return Array.isArray(data) ? data : (data?.data ?? [])
    },
    enabled: !!eventId,
  })
}

export function useCreateEventMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateEventPayload) => eventService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useUpdateEventMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateEventPayload> }) =>
      eventService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useDeleteEventMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eventService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}
