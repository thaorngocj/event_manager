import { z } from 'zod'
import { UserRole } from '@/types'

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  schoolId: z.string().min(1, 'School ID is required'),
  role: z.nativeEnum(UserRole),
})

export const updateUserSchema = createUserSchema.partial()

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
