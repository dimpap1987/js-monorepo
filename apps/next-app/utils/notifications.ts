import { API } from './api-proxy'

export async function fetchUserNotifications(
  userId: number,
  pagination = { page: 1, pageSize: 15 }
) {
  return API.url(
    `${process.env.NEXT_PUBLIC_AUTH_URL}/api/notifications/users/${userId}?page=${pagination.page}&pageSize=${pagination.pageSize}`
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
