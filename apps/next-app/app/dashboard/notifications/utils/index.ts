import {
  AuthUserFullDto,
  CreatePushNotificationType,
  NotificationCreateDto,
} from '@js-monorepo/types'
import { API } from '@next-app/utils/api-proxy'

export const findUsers = async (page = 1, pageSize = 50) => {
  const response = await API.url(
    `${process.env.NEXT_PUBLIC_AUTH_URL}/api/admin/users?page=${page}&pageSize=${pageSize}`
  )
    .get()
    .withCredentials()
    .execute()

  if (response.ok)
    return response.data as {
      users: AuthUserFullDto[] | []
      totalCount: number
    }

  return {
    users: [],
    totalCount: 0,
  }
}

export const submitNotification = async (payload: NotificationCreateDto) => {
  const response = await API.url(
    `${process.env.NEXT_PUBLIC_AUTH_URL}/api/notifications`
  )
    .post()
    .body(payload)
    .withCredentials()
    .withCsrf()
    .execute()
  return response
}

export const submitPushNotification = async (
  payload: CreatePushNotificationType
) => {
  const response = await API.url(
    `${process.env.NEXT_PUBLIC_AUTH_URL}/api/notifications/push-notification`
  )
    .post()
    .body(payload)
    .withCredentials()
    .withCsrf()
    .execute()
  return response
}
