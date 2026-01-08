import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreatePushNotificationType, NotificationCreateDto } from '@js-monorepo/types/notifications'
import { AuthUserFullDto } from '@js-monorepo/types/auth'
import { apiClient } from '@js-monorepo/utils/http'
import { handleQueryResponse, queryKeys } from '@js-monorepo/utils/http/queries'

interface UsersResponse {
  users: AuthUserFullDto[]
  totalCount: number
}

/**
 * Fetch users for notifications
 */
const fetchUsers = async (page = 1, pageSize = 50): Promise<UsersResponse> => {
  const response = await apiClient.get<UsersResponse>(`/admin/users?page=${page}&pageSize=${pageSize}`)
  return handleQueryResponse(response)
}

/**
 * Hook to fetch users for notifications
 */
export function useNotificationUsers(page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ['admin', 'users', 'notifications', page, pageSize],
    queryFn: () => fetchUsers(page, pageSize),
  })
}

/**
 * Hook to submit a notification
 */
export function useSubmitNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: NotificationCreateDto) => {
      const response = await apiClient.post(`/notifications`, payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      // Invalidate notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

/**
 * Hook to submit a push notification
 */
export function useSubmitPushNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreatePushNotificationType) => {
      const response = await apiClient.post('/notifications/push-notification', payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      // Invalidate notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
