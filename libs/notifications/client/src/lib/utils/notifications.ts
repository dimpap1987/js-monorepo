import {
  ClientResponseType,
  PaginationType,
  UserNotificationType,
} from '@js-monorepo/types'
import { HttpClientProxy } from '@js-monorepo/utils/http'
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
  return new HttpClientProxy()
    .builder()
    .url(
      `${process.env.NEXT_PUBLIC_AUTH_URL}/api/notifications/users/${userId}${queryString}`
    )
    .get()
    .withCredentials()
    .execute()
}

export async function apiReadNotification(notificationId: number) {
  return new HttpClientProxy()
    .builder()
    .url(
      `${process.env.NEXT_PUBLIC_AUTH_URL}/api/notifications/${notificationId}/read`
    )
    .patch()
    .withCredentials()
    .execute()
}

export async function apiReadAllNotifications() {
  return new HttpClientProxy()
    .builder()
    .url(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/notifications/read-all`)
    .patch()
    .withCredentials()
    .execute()
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
