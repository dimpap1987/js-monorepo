import { z } from 'zod'

export const CreateClassSchema = z.object({
  locationId: z.number(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  capacity: z.number().int().positive().optional().nullable(),
  waitlistLimit: z.number().int().nonnegative().optional().nullable(),
  isCapacitySoft: z.boolean().optional(),
  isPrivate: z.boolean().optional(),
  tagIds: z.array(z.number().int()).optional(), // TODO change to required
})
export type CreateClassDto = z.infer<typeof CreateClassSchema>

export const UpdateClassSchema = z.object({
  locationId: z.number().optional(),
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional().nullable(),
  capacity: z.number().int().positive().optional().nullable(),
  waitlistLimit: z.number().int().nonnegative().optional().nullable(),
  isCapacitySoft: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isPrivate: z.boolean().optional(),
  tagIds: z.array(z.number().int()).optional(),
})
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
  isPrivate: boolean
  createdAt: Date
  location?: {
    id: number
    name: string
    timezone: string
    isOnline: boolean
  }
  tags: { id: number; name: string }[]
}

export interface ClassListResponseDto {
  classes: ClassResponseDto[]
  total: number
}
