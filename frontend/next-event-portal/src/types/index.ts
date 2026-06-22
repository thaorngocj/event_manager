export enum UserRole {
  STUDENT = 'STUDENT',
  EVENT_MANAGER = 'EVENT_MANAGER',
  ADMIN = 'ADMIN',
}

export enum EventStatus {
  UPCOMING = 'UPCOMING',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  COMPLETED = 'COMPLETED',
}

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  role: UserRole
  schoolId?: string
  createdAt: number
}

export interface Event {
  id: string
  slug?: string
  title: string | { EN: string; VI: string }
  description: string | { EN: string; VI: string }
  location: string | { EN: string; VI: string }
  date: string
  startTime: string
  endTime: string
  capacity: number
  status: EventStatus
  organizerId: string
  category: string
  color?: string
  image?: string
  closingDate?: string
  displayCategory?: 'HERO' | 'FEATURED' | 'HIGHLIGHT' | 'NORMAL'
  createdAt: number
  isRegistrationOpen?: boolean
  registeredCount?: number
}

export interface Registration {
  id: string
  eventId: string
  userId: string
  status: 'REGISTERED' | 'APPROVED' | 'ATTENDED' | 'CANCELLED'
  registeredAt: number
  attendedAt?: number
  checkedInBy?: string
}

export interface HistoricalImport {
  id: string
  eventName: string
  date: string
  participantEmails: string[]
  importedAt: number
  adminId: string
}
