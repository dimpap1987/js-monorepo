import {
  CreateOrganizerSchema,
  UpdateOrganizerSchema,
  type CreateOrganizerDto,
  type UpdateOrganizerDto,
  type OrganizerPublicProfileResponse,
} from '@js-monorepo/schemas'

// Re-export for backward compatibility
export {
  CreateOrganizerSchema,
  UpdateOrganizerSchema,
  type CreateOrganizerDto,
  type UpdateOrganizerDto,
  type OrganizerPublicProfileResponse as OrganizerPublicProfileDto,
}

export interface OrganizerResponseDto {
  id: number
  displayName: string | null
  bio: string | null
  slug: string | null
  defaultLocationId: number | null
  createdAt: Date
}
