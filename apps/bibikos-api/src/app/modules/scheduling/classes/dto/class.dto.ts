import * as z from 'zod'

export const CreateClassSchema = z.object({
  locationId: z.number().int().positive('Location ID is required'),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(5000).optional().nullable(),
  capacity: z.number().int().positive('Capacity must be a positive number').optional().nullable(),
  waitlistLimit: z.number().int().min(0, 'Waitlist limit cannot be negative').optional().nullable(),
  isCapacitySoft: z.boolean().default(false),
})

export const UpdateClassSchema = CreateClassSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type CreateClassDto = z.infer<typeof CreateClassSchema>
export type UpdateClassDto = z.infer<typeof UpdateClassSchema>

export interface ClassResponseDto {
  id: number
  organizerId: number
  locationId: number
  title: string
  description: string | null
  capacity: number | null
  waitlistLimit: number | null
  isCapacitySoft: boolean
  isActive: boolean
  createdAt: Date
  location?: {
    id: number
    name: string
    timezone: string
    isOnline: boolean
  }
}

export interface ClassListResponseDto {
  classes: ClassResponseDto[]
  total: number
}
