import { z } from 'zod'
import { EventStatus } from '@/types'

const localizedStringSchema = z.union([
  z.string().min(1),
  z.object({ EN: z.string().min(1), VI: z.string().min(1) }),
])

export const eventSchema = z.object({
  title: localizedStringSchema,
  description: localizedStringSchema,
  location: localizedStringSchema,
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  capacity: z.number().int().positive('Capacity must be a positive number'),
  status: z.nativeEnum(EventStatus),
  organizerId: z.string().min(1),
  category: z.string().min(1, 'Category is required'),
  image: z.string().url().optional().or(z.literal('')),
  closingDate: z.string().optional(),
  displaySection: z.enum(['FEATURED', 'CATEGORIES', 'RECOMMENDED', 'PROPOSED']).optional(),
})

export type EventInput = z.infer<typeof eventSchema>
