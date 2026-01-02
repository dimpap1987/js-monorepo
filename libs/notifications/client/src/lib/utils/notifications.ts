import { getRelativeTime, fromISOString } from '@js-monorepo/utils/date'
import { ClientResponseType, PaginationType, UserNotificationType } from '@js-monorepo/types'
import { apiClient } from '@js-monorepo/utils/http'

export async function apiFetchUserNotifications(
  userId: number,
  searchParams?: string
): Promise<
  ClientResponseType<
    PaginationType & {
      unReadTotal?: number
    }
  >
> {
  const queryString = searchParams ? `${searchParams}` : ''
  return apiClient.get(`/notifications/users/${userId}${queryString}`)
}

export async function apiReadNotification(notificationId: number) {
  return apiClient.patch(`/notifications/${notificationId}/read`)
}

export async function apiReadAllNotifications() {
  return apiClient.patch('/notifications/read-all')
}

export function humanatizeNotificationDate(date: string | Date): string {
  if (!date) return 'Invalid date'
  try {
    const dateObj = typeof date === 'string' ? fromISOString(date) : date
    return getRelativeTime(dateObj)
  } catch (error) {
    return 'Invalid date'
  }
}

export const updateNotificationAsRead = (
  notifications: UserNotificationType[],
  notificationId: number
): UserNotificationType[] => {
  return notifications?.map((item) => (item.notification?.id === notificationId ? { ...item, isRead: true } : item))
}
