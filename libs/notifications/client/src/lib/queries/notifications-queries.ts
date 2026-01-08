import { UserNotificationType } from '@js-monorepo/types/notifications'
import { CursorPaginationType, PaginationType } from '@js-monorepo/types/pagination'
import { apiClient } from '@js-monorepo/utils/http'
import { handleQueryResponse, queryKeys } from '@js-monorepo/utils/http/queries'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface NotificationsResponse extends PaginationType<UserNotificationType> {
  unReadTotal?: number
}

interface CursorNotificationsResponse extends CursorPaginationType<UserNotificationType> {
  unReadTotal?: number
}

/**
 * Fetch user notifications (cursor-based)
 */
const fetchUserNotificationsByCursor = async (
  userId: number,
  cursor: number | null,
  limit: number
): Promise<CursorNotificationsResponse> => {
  const params = new URLSearchParams()
  if (cursor !== null) {
    params.set('cursor', cursor.toString())
  }
  params.set('limit', limit.toString())
  const queryString = params.toString()
  const response = await apiClient.get<CursorNotificationsResponse>(
    `/notifications/users/${userId}${queryString ? `?${queryString}` : ''}`
  )
  return handleQueryResponse(response)
}

/**
 * Fetch user notifications (legacy - for backward compatibility)
 */
const fetchUserNotifications = async (userId: number, searchParams?: string): Promise<NotificationsResponse> => {
  const queryString = searchParams ? `${searchParams}` : ''
  const response = await apiClient.get<NotificationsResponse>(`/notifications/users/${userId}${queryString}`)
  return handleQueryResponse(response)
}

export function useUserNotificationsByCursor(userId: number | undefined, cursor: number | null, limit = 15) {
  return useQuery({
    queryKey: queryKeys.notifications.user(userId || 0, `cursor=${cursor}&limit=${limit}`),
    queryFn: () => fetchUserNotificationsByCursor(userId as number, cursor, limit),
    enabled: !!userId,
    placeholderData: (previousData) => previousData,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  })
}

export function useUserNotifications(userId: number | undefined, searchParams?: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications.user(userId || 0, searchParams),
    queryFn: () => fetchUserNotifications(userId as number, searchParams),
    enabled: !!userId && enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false,
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
        (oldData: NotificationsResponse | CursorNotificationsResponse | undefined) => {
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
