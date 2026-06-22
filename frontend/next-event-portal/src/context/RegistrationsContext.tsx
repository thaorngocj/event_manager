'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Registration } from '@/types';
import { registrationService } from '@/services/registration.service';

interface RegistrationsContextType {
  registrations: Registration[];
  registerForEvent: (userId: string, eventId: string) => Promise<void>;
  cancelRegistration: (regId: string) => Promise<void>;
  updateRegistrationStatus: (regId: string, status: Registration['status']) => Promise<void>;
  isUserRegistered: (userId: string, eventId: string) => boolean;
  getUserRegistrations: (userId: string) => Registration[];
  reload: () => Promise<void>;
}

const STORAGE_KEY = 'va_registrations';

const API_STATUS_MAP: Record<string, Registration['status']> = {
  REGISTERED: 'APPROVED',
  CHECKED_IN: 'ATTENDED',
  CANCELLED: 'CANCELLED',
};

function toUiRegistration(r: Record<string, unknown>): Registration {
  const user = r.user as Record<string, unknown> | undefined;
  const event = r.event as Record<string, unknown> | undefined;
  return {
    id: String(r.id),
    userId: String(r.userId || user?.id || ''),
    eventId: String(r.eventId || event?.id || ''),
    status: API_STATUS_MAP[r.status as string] ?? 'REGISTERED',
    registeredAt: r.createdAt ? new Date(r.createdAt as string).getTime() : Date.now(),
    attendedAt: r.checkedInAt ? new Date(r.checkedInAt as string).getTime() : undefined,
    checkedInBy: r.checkedInBy ? String(r.checkedInBy) : undefined,
  };
}

const RegistrationsContext = createContext<RegistrationsContextType | undefined>(undefined);

export function RegistrationsProvider({ children }: { children: React.ReactNode }) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const loadFromApi = useCallback(async (): Promise<boolean> => {
    try {
      const data = await registrationService.getMyEvents();
      const list: Record<string, unknown>[] = Array.isArray(data) ? data : (data?.data ?? data?.items ?? []);
      if (list.length > 0) {
        const uiRegs = list.map(toUiRegistration);
        setRegistrations(uiRegs);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(uiRegs));
        return true;
      }
    } catch {
      // API unavailable or not a student account
    }
    return false;
  }, []);

  useEffect(() => {
    async function init() {
      const ok = await loadFromApi();
      if (ok) return;
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setRegistrations(JSON.parse(saved));
          return;
        } catch {
          // corrupted — use empty
        }
      }
      const sample: Registration[] = [];
      setRegistrations(sample);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
    }
    init();
  }, [loadFromApi]);

  const reload = useCallback(async () => {
    await loadFromApi();
  }, [loadFromApi]);

  const persist = useCallback((updated: Registration[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const isUserRegistered = useCallback((userId: string, eventId: string) => {
    return registrations.some(r => r.userId === userId && r.eventId === eventId && r.status !== 'CANCELLED');
  }, [registrations]);

  const registerForEvent = useCallback(async (userId: string, eventId: string) => {
    if (isUserRegistered(userId, eventId)) return;
    try {
      const result = await registrationService.register(eventId);
      const newReg: Registration = result?.id
        ? toUiRegistration({ ...result, userId })
        : {
            id: String(result?.id ?? Math.random().toString(36).substr(2, 9)),
            userId,
            eventId,
            status: 'APPROVED',
            registeredAt: Date.now(),
          };
      setRegistrations(prev => {
        const updated = [...prev, newReg];
        persist(updated);
        return updated;
      });
    } catch (error: any) {
      throw error;
    }
  }, [isUserRegistered, persist]);

  const cancelRegistration = useCallback(async (regId: string) => {
    try {
      await registrationService.cancel(regId);
    } catch {
      // API failed — update locally anyway
    }
    setRegistrations(prev => {
      const updated = prev.map(r => r.id === regId ? { ...r, status: 'CANCELLED' as const } : r);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const updateRegistrationStatus = useCallback(async (regId: string, status: Registration['status']) => {
    if (status === 'ATTENDED') {
      const reg = registrations.find(r => r.id === regId);
      if (reg) {
        try {
          await registrationService.checkin(reg.eventId, {});
        } catch {
          // API failed — update locally anyway
        }
      }
    }
    setRegistrations(prev => {
      const updated = prev.map(r => r.id === regId ? { ...r, status } : r);
      persist(updated);
      return updated;
    });
  }, [registrations, persist]);

  const getUserRegistrations = useCallback((userId: string) => {
    return registrations.filter(r => r.userId === userId);
  }, [registrations]);

  return (
    <RegistrationsContext.Provider value={{ registrations, registerForEvent, cancelRegistration, updateRegistrationStatus, isUserRegistered, getUserRegistrations, reload }}>
      {children}
    </RegistrationsContext.Provider>
  );
}

export function useRegistrations() {
  const context = useContext(RegistrationsContext);
  if (context === undefined) {
    throw new Error('useRegistrations must be used within a RegistrationsProvider');
  }
  return context;
}
