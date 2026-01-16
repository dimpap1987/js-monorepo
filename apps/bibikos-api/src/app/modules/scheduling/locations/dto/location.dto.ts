import * as z from 'zod'

// IANA timezone validation (basic pattern)
const timezoneSchema = z
  .string()
  .max(50)
  .regex(/^[A-Za-z_]+\/[A-Za-z_]+$|^UTC$/, 'Invalid timezone format (e.g., Europe/Athens, UTC)')

export const CreateLocationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  countryCode: z
    .string()
    .length(2, 'Country code must be exactly 2 characters')
    .regex(/^[A-Z]{2}$/, 'Country code must be 2 uppercase letters'),
  city: z.string().max(255).optional().nullable(),
  address: z.string().max(1000).optional().nullable(),
  timezone: timezoneSchema,
  isOnline: z.boolean().default(false),
  onlineUrl: z.string().url('Must be a valid URL').max(500).optional().nullable(),
})

export const UpdateLocationSchema = CreateLocationSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type CreateLocationDto = z.infer<typeof CreateLocationSchema>
export type UpdateLocationDto = z.infer<typeof UpdateLocationSchema>

export interface LocationResponseDto {
  id: number
  name: string
  countryCode: string
  city: string | null
  address: string | null
  timezone: string
  isOnline: boolean
  onlineUrl: string | null
  isActive: boolean
  createdAt: Date
}
