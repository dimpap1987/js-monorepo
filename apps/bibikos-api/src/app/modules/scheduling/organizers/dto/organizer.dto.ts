import {
  CreateOrganizerSchema,
  UpdateOrganizerSchema,
  type CreateOrganizerDto,
  type UpdateOrganizerDto,
} from '@js-monorepo/schemas'

// Re-export for backward compatibility
export { CreateOrganizerSchema, UpdateOrganizerSchema, type CreateOrganizerDto, type UpdateOrganizerDto }

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
