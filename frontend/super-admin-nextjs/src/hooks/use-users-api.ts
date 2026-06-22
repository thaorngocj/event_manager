"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/user.service'
import { User, UserRole } from '@/types'

const ROLE_MAP: Record<string, UserRole> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  EVENT_MANAGER: 'Manager',
  STUDENT: 'Student',
}

const ROLE_MAP_REVERSE: Record<string, string> = {
  'Super Admin': 'SUPER_ADMIN',
  Admin: 'ADMIN',
  Manager: 'EVENT_MANAGER',
  Student: 'STUDENT',
}

function toUiUser(u: Record<string, unknown>): User {
  return {
    id: u.id as string,
    name: (u.username || u.name || u.email) as string,
    email: u.email as string,
    role: (ROLE_MAP[u.role as string] ?? u.role) as UserRole,
    status: (u.isActive ?? u.active) !== false ? 'HOẠT ĐỘNG' : 'KHOÁ',
  }
}

export function useUsersQuery(search?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['users', search, page, limit],
    queryFn: async () => {
      try {
        const data = await userService.getAll({ search, page, limit })
        if (Array.isArray(data)) {
          return { data: data.map(toUiUser) as User[], total: data.length, page: 1, totalPages: 1 }
        }
        const list: Record<string, unknown>[] = data?.data ?? data?.items ?? []
        return {
          data: list.map(toUiUser) as User[],
          total: (data?.total ?? data?.count ?? list.length) as number,
          page: (data?.page ?? page) as number,
          totalPages: (data?.totalPages ?? data?.pages ?? 1) as number,
        }
      } catch {
        return { data: [] as User[], total: 0, page: 1, totalPages: 1 }
      }
    },
  })
}

export function useCreateUserMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: {
      username: string; email: string; password: string; role: string
      mssv?: string; facultyId?: number; major?: string; cohort?: string; classId?: string
      trainingPoints?: number; unionRole?: string
    }) => userService.create({ ...p, role: ROLE_MAP_REVERSE[p.role] ?? p.role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useUpdateUserMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: { username?: string; email?: string; role?: string } }) => {
      const profilePayload: { username?: string; email?: string } = {}
      if (payload.username) profilePayload.username = payload.username
      if (payload.email) profilePayload.email = payload.email
      if (Object.keys(profilePayload).length > 0) {
        await userService.update(id, profilePayload)
      }
      if (payload.role) {
        await userService.changeRole(id, ROLE_MAP_REVERSE[payload.role] ?? payload.role)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useDeleteUserMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useActivateUserMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => userService.activate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useDeactivateUserMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => userService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useImportUsersMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => userService.importUsers(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useDownloadImportTemplate() {
  return useMutation({
    mutationFn: async () => {
      const response = await userService.downloadImportTemplate()
      const blob = new Blob([response.data], { type: String(response.headers['content-type'] || 'application/octet-stream') })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const disposition = response.headers['content-disposition'] ?? ''
      const match = disposition.match(/filename[^;=\n]*=(['"]?)([^'"\n]*)\1/)
      a.download = match?.[2] || 'import_users_template.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    },
  })
}
