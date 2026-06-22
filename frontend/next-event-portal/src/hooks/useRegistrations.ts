'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { registrationService } from '@/services/registration.service'

export function useMyRegistrations() {
  return useQuery({
    queryKey: ['registrations', 'my-events'],
    queryFn: () => registrationService.getMyEvents(),
  })
}

export function useRegisterForEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) => registrationService.register(eventId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['registrations'] }),
  })
}

export function useCheckin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ eventId, qrData }: { eventId: string; qrData: string }) =>
      registrationService.checkin(eventId, { qrData }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['registrations'] }),
  })
}
