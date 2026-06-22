"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { facultyService, type CreateFacultyPayload } from '@/services/faculty.service'

export function useFacultiesQuery() {
  return useQuery({
    queryKey: ['faculties'],
    queryFn: async () => {
      try {
        const data = await facultyService.getAll()
        const list = Array.isArray(data) ? data : (data?.data ?? data?.items ?? [])
        return list.map((f: Record<string, unknown>) => ({
          id: String(f.id),
          code: String(f.code ?? ''),
          name: String(f.name ?? ''),
          description: String(f.description ?? ''),
          createdAt: String(f.createdAt ?? ''),
        }))
      } catch {
        return []
      }
    },
  })
}

export function useCreateFacultyMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateFacultyPayload) => facultyService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculties'] }),
  })
}

export function useUpdateFacultyMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateFacultyPayload> }) =>
      facultyService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculties'] }),
  })
}

export function useDeleteFacultyMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => facultyService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculties'] }),
  })
}
