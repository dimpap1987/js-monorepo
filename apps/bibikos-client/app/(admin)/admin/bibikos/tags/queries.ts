import { apiClient } from '@js-monorepo/utils/http'
import { handleQueryResponse } from '@js-monorepo/utils/http/queries'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// =============================================================================
// Types
// =============================================================================

export const TAG_ENTITY_TYPES = ['CLASS', 'ORGANIZER', 'LOCATION', 'PARTICIPANT'] as const
export type TagEntityType = (typeof TAG_ENTITY_TYPES)[number]

export const TAG_ENTITY_TYPE_LABELS: Record<TagEntityType, string> = {
  CLASS: 'Class',
  ORGANIZER: 'Organizer',
  LOCATION: 'Location',
  PARTICIPANT: 'Participant',
}

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

export interface CreateTagCategoryPayload {
  name: string
  slug: string
}

export interface UpdateTagCategoryPayload {
  name?: string
  slug?: string
}

export interface CreateTagPayload {
  name: string
  categoryId?: number
  applicableTo?: TagEntityType[]
}

export interface UpdateTagPayload {
  name?: string
  categoryId?: number | null
  applicableTo?: TagEntityType[]
}

// =============================================================================
// Query Keys
// =============================================================================

export const TAG_CATEGORIES_QUERY_KEY = ['admin', 'tag-categories']
export const TAGS_QUERY_KEY = ['admin', 'tags']

// =============================================================================
// Tag Categories Queries
// =============================================================================

export const fetchTagCategories = async (): Promise<TagCategory[]> => {
  const response = await apiClient.get<TagCategory[]>('/tag-categories')
  return handleQueryResponse(response)
}

export function useTagCategories() {
  return useQuery({
    queryKey: TAG_CATEGORIES_QUERY_KEY,
    queryFn: fetchTagCategories,
  })
}

export function useCreateTagCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateTagCategoryPayload) => {
      const response = await apiClient.post<TagCategory>('/admin/tag-categories', payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAG_CATEGORIES_QUERY_KEY })
    },
  })
}

export function useUpdateTagCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateTagCategoryPayload }) => {
      const response = await apiClient.patch<TagCategory>(`/admin/tag-categories/${id}`, payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAG_CATEGORIES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY })
    },
  })
}

export function useDeleteTagCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/admin/tag-categories/${id}`)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAG_CATEGORIES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY })
    },
  })
}

// =============================================================================
// Tags Queries
// =============================================================================

export const fetchTags = async (): Promise<Tag[]> => {
  const response = await apiClient.get<Tag[]>('/tags')
  return handleQueryResponse(response)
}

export function useTags() {
  return useQuery({
    queryKey: TAGS_QUERY_KEY,
    queryFn: fetchTags,
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateTagPayload) => {
      const response = await apiClient.post<Tag>('/admin/tags', payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY })
    },
  })
}

export function useUpdateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateTagPayload }) => {
      const response = await apiClient.patch<Tag>(`/admin/tags/${id}`, payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY })
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/admin/tags/${id}`)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY })
    },
  })
}
