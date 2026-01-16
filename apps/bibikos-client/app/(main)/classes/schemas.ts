import { z } from 'zod'

export const classSchema = z.object({
  title: z.string().min(2, 'Class title is required'),
  description: z.string().optional(),
  locationId: z.coerce.number().min(1, 'Location is required'),
  capacity: z.coerce.number().min(1).optional().or(z.literal('')),
  waitlistLimit: z.coerce.number().min(0).optional().or(z.literal('')),
  isCapacitySoft: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export type ClassFormData = z.infer<typeof classSchema>
