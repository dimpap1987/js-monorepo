import { ClientResponseType, PaginationType } from '@js-monorepo/types'
import { API } from './api-proxy'

export async function fetchUserNotifications(
  userId: number,
  searchParams?: string
): Promise<
  ClientResponseType<
    PaginationType & {
      unReadTotal?: number
    }
  >
> {
  const queryString = searchParams ? `?${searchParams}` : ''
  return API.url(
    `${process.env.NEXT_PUBLIC_AUTH_URL}/api/notifications/users/${userId}${queryString}`
  )
    .get()
    .withCredentials()
    .execute()
}

export async function readNotification(notificationId: number) {
  return API.url(
    `${process.env.NEXT_PUBLIC_AUTH_URL}/api/notifications/${notificationId}/read`
  )
    .patch()
    .withCredentials()
    .execute()
}
