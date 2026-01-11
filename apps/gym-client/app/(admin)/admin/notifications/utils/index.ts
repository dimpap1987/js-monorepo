import { AuthUserFullDto } from '@js-monorepo/types/auth'
import { CreatePushNotificationType, NotificationCreateDto } from '@js-monorepo/types/notifications'
import { PaginationType } from '@js-monorepo/types/pagination'
import { apiClient } from '@js-monorepo/utils/http'

export const findUsers = async (page = 1, pageSize = 50): Promise<PaginationType<AuthUserFullDto>> => {
  const response = await apiClient.get<PaginationType<AuthUserFullDto>>(
    `/admin/users?page=${page}&pageSize=${pageSize}`
  )

  if (response.ok && response.data) {
    return response.data
  }

  return {
    page,
    pageSize,
    content: [],
    totalCount: 0,
    totalPages: 0,
  }
}

export const submitNotification = async (payload: NotificationCreateDto) => {
  return apiClient.post(`/notifications`, payload)
}

export const submitPushNotification = async (payload: CreatePushNotificationType) => {
  return apiClient.post('/notifications/push-notification', payload)
}
