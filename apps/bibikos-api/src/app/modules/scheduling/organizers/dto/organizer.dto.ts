import * as z from 'zod'

// Slug validation: lowercase letters, numbers, and hyphens only
const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(100)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only (e.g., john-doe)')

export const CreateOrganizerSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(255).optional(),
  bio: z.string().max(5000).optional().nullable(),
  slug: slugSchema.optional(),
  activityLabel: z.string().max(255).optional().nullable(),
  cancellationPolicy: z.string().max(5000).optional().nullable(),
  defaultLocationId: z.number().int().positive().optional().nullable(),
})

export const UpdateOrganizerSchema = CreateOrganizerSchema.partial()

export type CreateOrganizerDto = z.infer<typeof CreateOrganizerSchema>
export type UpdateOrganizerDto = z.infer<typeof UpdateOrganizerSchema>

export interface OrganizerResponseDto {
  id: number
  displayName: string | null
  bio: string | null
  slug: string | null
  activityLabel: string | null
  cancellationPolicy: string | null
  defaultLocationId: number | null
  createdAt: Date
}

// Public profile for /coach/:slug endpoint
export interface OrganizerPublicProfileDto {
  displayName: string | null
  bio: string | null
  slug: string
  activityLabel: string | null
}
