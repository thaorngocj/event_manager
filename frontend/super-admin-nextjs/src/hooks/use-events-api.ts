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
    organizer: (e.organizer as string) ?? '',
    contactEmail: (e.contactEmail as string) ?? '',
    contactPhone: (e.contactPhone as string) ?? '',
    registrationDeadline: (e.registrationDeadline as string) ?? '',
    trainingPoints: (e.trainingPoints as number) ?? 0,
    semester: (e.semester as string) ?? '',
    academicYear: (e.academicYear as string) ?? '',
    scale: (e.scale as string) ?? 'SCHOOL',
    isMandatory: (e.isMandatory as boolean) ?? false,
    facultyId: e.facultyId ? String(e.facultyId) : null,
  }
}

export function useEventsQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['events', page, limit],
    queryFn: async () => {
      try {
        const data = await eventService.getAll({ page, limit })
        if (Array.isArray(data)) {
          return { data: data.map(toUiEvent), total: data.length, page: 1, totalPages: 1 }
        }
        const list: Record<string, unknown>[] = data?.data ?? data?.items ?? []
        return {
          data: list.map(toUiEvent),
          total: (data?.total ?? data?.count ?? list.length) as number,
          page: (data?.page ?? page) as number,
          totalPages: (data?.totalPages ?? data?.pages ?? 1) as number,
        }
      } catch (error) {
        console.error("Failed to load events:", error)
        return { data: [], total: 0, page: 1, totalPages: 1 }
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
