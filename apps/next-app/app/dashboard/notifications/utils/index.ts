import { AuthUserFullDto } from '@js-monorepo/types/auth'
import { CreatePushNotificationType, NotificationCreateDto } from '@js-monorepo/types/notifications'
import { apiClient } from '@js-monorepo/utils/http'

export const findUsers = async (page = 1, pageSize = 50) => {
  const response = await apiClient.get(`/admin/users?page=${page}&pageSize=${pageSize}`)

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
  return apiClient.post(`/notifications`, payload)
}

export const submitPushNotification = async (payload: CreatePushNotificationType) => {
  return apiClient.post('/notifications/push-notification', payload)
}
