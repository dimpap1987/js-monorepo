import {
  ClientResponseType,
  PaginationType,
  UserNotificationType,
} from '@js-monorepo/types'
import { apiClient } from '@js-monorepo/utils/http'
import moment from 'moment'

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

export function humanatizeNotificationDate(date: string | Date) {
  const momentDate = moment(date)
  if (!momentDate.isValid()) return 'Invalid date'

  const timeDifference = moment().diff(momentDate)
  const formattedDifference = moment.duration(timeDifference).humanize()
  return formattedDifference
}

export const updateNotificationAsRead = (
  notifications: UserNotificationType[],
  notificationId: number
): UserNotificationType[] => {
  return notifications?.map((item) =>
    item.notification?.id === notificationId ? { ...item, isRead: true } : item
  )
}
