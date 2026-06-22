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

export function useUsersQuery(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      try {
        const response = await userService.getAll({
          search: params?.search,
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        })
        const list: Record<string, unknown>[] = Array.isArray(response) ? response : (response?.data ?? response?.items ?? [])
        return {
          data: list.map(toUiUser) as User[],
          total: response?.total ?? list.length,
          page: response?.page ?? 1,
          limit: response?.limit ?? list.length,
          totalPages: response?.totalPages ?? 1,
        }
      } catch (error) {
        console.error("Failed to load users:", error);
        return { data: [], total: 0, page: 1, limit: 10, totalPages: 1 };
      }
    },
  })
}

export function useCreateUserMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: { username: string; email: string; password: string; role: string }) =>
      userService.create({ ...p, role: ROLE_MAP_REVERSE[p.role] ?? p.role }),
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
