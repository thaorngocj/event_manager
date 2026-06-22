'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventService } from '@/services/event.service'
import { Event } from '@/types'

export function useEventsQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => eventService.getAll(params),
  })
}

export function useEventQuery(id: string | number) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => eventService.getOne(id),
    enabled: !!id,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<Event, 'id' | 'createdAt'>) => eventService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Event> }) =>
      eventService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eventService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })
}
