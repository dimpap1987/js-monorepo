import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PaginationType, UserNotificationType } from '@js-monorepo/types'
import { apiClient } from '@js-monorepo/utils/http'
import { handleQueryResponse, queryKeys } from '@js-monorepo/utils/http/queries'

interface NotificationsResponse extends PaginationType<UserNotificationType> {
  unReadTotal?: number
}

/**
 * Fetch user notifications
 */
const fetchUserNotifications = async (userId: number, searchParams?: string): Promise<NotificationsResponse> => {
  const queryString = searchParams ? `${searchParams}` : ''
  const response = await apiClient.get<NotificationsResponse>(`/notifications/users/${userId}${queryString}`)
  return handleQueryResponse(response)
}

/**
 * Hook to fetch user notifications
 */
export function useUserNotifications(userId: number | undefined, searchParams?: string) {
  return useQuery({
    queryKey: queryKeys.notifications.user(userId || 0, searchParams),
    queryFn: () => fetchUserNotifications(userId as number, searchParams),
    enabled: !!userId, // Only fetch if userId exists
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  })
}

/**
 * Hook to mark a notification as read
 */
export function useReadNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiClient.patch(`/notifications/${notificationId}/read`)
      return handleQueryResponse(response)
    },
    onSuccess: (_, notificationId) => {
      queryClient.setQueriesData(
        { queryKey: ['notifications', 'user'] },
        (oldData: NotificationsResponse | undefined) => {
          if (!oldData?.content) return oldData
          const wasUnread = oldData.content.find((item) => item.notification?.id === notificationId && !item.isRead)
          return {
            ...oldData,
            content: oldData.content.map((item) =>
              item.notification?.id === notificationId ? { ...item, isRead: true } : item
            ),
            unReadTotal: wasUnread ? Math.max(0, (oldData.unReadTotal ?? 0) - 1) : oldData.unReadTotal,
          }
        }
      )
    },
  })
}

/**
 * Hook to mark all notifications as read
 */
export function useReadAllNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch('/notifications/read-all')
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.setQueriesData(
        { queryKey: ['notifications', 'user'] },
        (oldData: NotificationsResponse | undefined) => {
          if (!oldData?.content) return oldData
          return {
            ...oldData,
            content: oldData.content.map((content) => ({ ...content, isRead: true })),
            unReadTotal: 0,
          }
        }
      )
    },
  })
}
