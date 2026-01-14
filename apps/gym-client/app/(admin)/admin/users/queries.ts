import { UpdateUserSchemaType } from '@js-monorepo/schemas'
import { AuthUserFullDto } from '@js-monorepo/types/auth'
import { PaginationType } from '@js-monorepo/types/pagination'
import { apiClient } from '@js-monorepo/utils/http'
import { handleQueryResponse, queryKeys } from '@js-monorepo/utils/http/queries'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

/**
 * Fetch users with pagination and search
 */
const findUsers = async (searchParams?: string): Promise<PaginationType<AuthUserFullDto>> => {
  const response = await apiClient.get<PaginationType<AuthUserFullDto>>(`/admin/users${searchParams || ''}`)
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
    mutationFn: async ({ userId, data }: { userId: number; data: UpdateUserSchemaType }) => {
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

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiClient.delete(`/admin/users/${userId}`)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() })
    },
  })
}

/**
 * Hook to ban a user
 */
export function useBanUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiClient.post(`/admin/users/${userId}/ban`)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() })
    },
  })
}

/**
 * Hook to unban a user
 */
export function useUnbanUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiClient.post(`/admin/users/${userId}/unban`)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() })
    },
  })
}

/**
 * Hook to deactivate a user
 */
export function useDeactivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiClient.post(`/admin/users/${userId}/deactivate`)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() })
    },
  })
}
