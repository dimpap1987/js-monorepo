/**
 * Query hooks for dashboard users
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AuthUserFullDto, AuthUserUpdateDto } from '@js-monorepo/types/auth'
import { apiClient } from '@js-monorepo/utils/http'
import { handleQueryResponse, queryKeys } from '@js-monorepo/utils/http/queries'

interface UsersResponse {
  users: AuthUserFullDto[]
  totalCount: number
}

/**
 * Fetch users with pagination and search
 */
const findUsers = async (searchParams?: string): Promise<UsersResponse> => {
  const response = await apiClient.get<UsersResponse>(`/admin/users${searchParams || ''}`)
  return handleQueryResponse(response)
}

/**
 * Hook to fetch users
 */
export function useUsers(searchParams?: string) {
  return useQuery({
    queryKey: queryKeys.admin.users(searchParams),
    queryFn: () => findUsers(searchParams),
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  })
}

/**
 * Hook to update a user
 * Note: Callbacks for notifications should be handled in the component
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: number; data: AuthUserUpdateDto }) => {
      const response = await apiClient.put(`/admin/users/${userId}`, data)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      // Invalidate and refetch users queries
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() })
    },
  })
}

interface ImpersonateResponse {
  success: boolean
  user?: AuthUserFullDto
  message?: string
}

/**
 * Hook to impersonate a user
 */
export function useImpersonateUser() {
  return useMutation({
    mutationFn: async (userId: number): Promise<ImpersonateResponse> => {
      const response = await apiClient.post<ImpersonateResponse>(`/admin/impersonate/${userId}`)
      return handleQueryResponse(response)
    },
  })
}
