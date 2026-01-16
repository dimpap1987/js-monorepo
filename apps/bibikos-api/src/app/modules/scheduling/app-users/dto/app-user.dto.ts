import * as z from 'zod'

// Schema for creating/updating app user preferences
export const UpdateAppUserSchema = z.object({
  fullName: z.string().max(255).optional().nullable(),
  locale: z
    .string()
    .max(10)
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Invalid locale format (e.g., en-US)')
    .optional(),
  timezone: z.string().max(50).optional(),
  countryCode: z
    .string()
    .length(2)
    .regex(/^[A-Z]{2}$/, 'Country code must be 2 uppercase letters')
    .optional()
    .nullable(),
})

export type UpdateAppUserDto = z.infer<typeof UpdateAppUserSchema>

// Response DTO
export interface AppUserResponseDto {
  id: number
  fullName: string | null
  locale: string
  timezone: string
  countryCode: string | null
  createdAt: Date
  hasOrganizerProfile: boolean
  hasParticipantProfile: boolean
}
