import { apiClient } from '@js-monorepo/utils/http'
import { handleQueryResponse } from '@js-monorepo/utils/http/queries'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PaginationType } from '@js-monorepo/types/pagination'

// =============================================================================
// Types
// =============================================================================

export interface AdminOrganizerTag {
  id: number
  name: string
  category: string | null
}

export interface AdminOrganizer {
  id: number
  displayName: string | null
  slug: string | null
  bio: string | null
  createdAt: string
  profileImage: string | null
  badges: AdminOrganizerTag[]
  selfSelectedTags: AdminOrganizerTag[]
}

export interface Badge {
  id: number
  name: string
  category: { id: number; name: string; slug: string } | null
  applicableTo: string[]
}

// =============================================================================
// Query Keys
// =============================================================================

export const ADMIN_ORGANIZERS_QUERY_KEY = ['admin', 'organizers']
export const ADMIN_BADGES_QUERY_KEY = ['admin', 'badges']

// =============================================================================
// Organizers Queries
// =============================================================================

export const fetchOrganizers = async (page: number, pageSize: number): Promise<PaginationType<AdminOrganizer>> => {
  const response = await apiClient.get<PaginationType<AdminOrganizer>>(
    `/admin/organizers?page=${page}&pageSize=${pageSize}`
  )
  return handleQueryResponse(response)
}

export function useOrganizers(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: [...ADMIN_ORGANIZERS_QUERY_KEY, page, pageSize],
    queryFn: () => fetchOrganizers(page, pageSize),
  })
}

// =============================================================================
// Badges Queries
// =============================================================================

export const fetchBadges = async (): Promise<Badge[]> => {
  const response = await apiClient.get<Badge[]>('/admin/badges')
  return handleQueryResponse(response)
}

export function useBadges() {
  return useQuery({
    queryKey: ADMIN_BADGES_QUERY_KEY,
    queryFn: fetchBadges,
  })
}

// =============================================================================
// Badge Assignment Mutations
// =============================================================================

export function useAssignBadge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ organizerId, badgeId }: { organizerId: number; badgeId: number }) => {
      const response = await apiClient.post(`/admin/organizers/${organizerId}/badges/${badgeId}`)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ORGANIZERS_QUERY_KEY })
    },
  })
}

export function useRemoveBadge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ organizerId, badgeId }: { organizerId: number; badgeId: number }) => {
      const response = await apiClient.delete(`/admin/organizers/${organizerId}/badges/${badgeId}`)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ORGANIZERS_QUERY_KEY })
    },
  })
}
