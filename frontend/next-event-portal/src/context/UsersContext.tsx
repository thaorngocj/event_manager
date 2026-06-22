'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRole } from '@/types';
import { userService } from '@/services/user.service';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Pending' | 'Inactive';
  schoolId: string;
}

interface UsersContextType {
  users: SystemUser[];
  loading: boolean;
  addUser: (user: Omit<SystemUser, 'id'>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateUser: (id: string, user: Partial<SystemUser>) => Promise<void>;
  setActive: (id: string, isActive: boolean) => Promise<void>;
}

function toSystemUser(u: Record<string, unknown>): SystemUser {
  return {
    id: String(u.id),
    name: String(u.username || u.name || ''),
    email: String(u.email || ''),
    role: (u.role as UserRole) || UserRole.STUDENT,
    status: u.isActive !== false ? 'Active' : 'Inactive',
    schoolId: String(u.mssv || ''),
  };
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await userService.getAll({ limit: 100 });
        const list: Record<string, unknown>[] = Array.isArray(data)
          ? data
          : (data?.data ?? data?.items ?? data?.users ?? []);
        setUsers(list.map(toSystemUser));
        return;
      } catch {
        // API unavailable or insufficient permissions — fall back to empty
      }
      setUsers([]);
    }
    loadUsers().finally(() => setLoading(false));
  }, []);

  const addUser = useCallback(async (userData: Omit<SystemUser, 'id'>) => {
    try {
      const created = await userService.create({
        username: userData.name,
        email: userData.email,
        password: 'Va@123456',
        mssv: userData.schoolId || undefined,
        role: userData.role,
      });
      setUsers(prev => [...prev, toSystemUser(created as Record<string, unknown>)]);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) throw new Error('Không có quyền tạo người dùng mới.');
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    try {
      await userService.delete(id);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) throw new Error('Không có quyền xóa người dùng.');
      throw err;
    }
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  const updateUser = useCallback(async (id: string, userData: Partial<SystemUser>) => {
    try {
      if (userData.role !== undefined) {
        await userService.updateRole(id, { role: userData.role });
      }
      const profileFields: Record<string, unknown> = {};
      if (userData.name !== undefined) profileFields.username = userData.name;
      if (userData.email !== undefined) profileFields.email = userData.email;
      if (userData.schoolId !== undefined) profileFields.mssv = userData.schoolId;
      if (Object.keys(profileFields).length > 0) {
        await userService.update(id, profileFields);
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) throw new Error('Không có quyền chỉnh sửa người dùng.');
      throw err;
    }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...userData } : u));
  }, []);

  const setActive = useCallback(async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await userService.activate(id);
      } else {
        await userService.deactivate(id);
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) throw new Error('Không có quyền thay đổi trạng thái tài khoản.');
      throw err;
    }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: isActive ? 'Active' : 'Inactive' } : u));
  }, []);

  return (
    <UsersContext.Provider value={{ users, loading, addUser, deleteUser, updateUser, setActive }}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
}
