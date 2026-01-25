import { apiClient } from '@js-monorepo/utils/http'
import { handleQueryResponse } from '@js-monorepo/utils/http/queries'
import { useQuery } from '@tanstack/react-query'

// =============================================================================
// Types
// =============================================================================

export const TAG_ENTITY_TYPES = ['CLASS', 'ORGANIZER', 'LOCATION', 'PARTICIPANT'] as const
export type TagEntityType = (typeof TAG_ENTITY_TYPES)[number]

export interface TagCategory {
  id: number
  name: string
  slug: string
}

export interface Tag {
  id: number
  name: string
  category: TagCategory | null
  applicableTo: TagEntityType[]
}

// =============================================================================
// Query Keys
// =============================================================================

export const TAGS_BY_ENTITY_TYPE_KEY = (entityType: TagEntityType) => ['tags', 'by-entity-type', entityType]

// =============================================================================
// Queries
// =============================================================================

export const fetchTagsByEntityType = async (entityType: TagEntityType): Promise<Tag[]> => {
  const response = await apiClient.get<Tag[]>(`/tags/by-entity-type/${entityType}`)
  return handleQueryResponse(response)
}

export function useTagsByEntityType(entityType: TagEntityType) {
  return useQuery({
    queryKey: TAGS_BY_ENTITY_TYPE_KEY(entityType),
    queryFn: () => fetchTagsByEntityType(entityType),
  })
}
