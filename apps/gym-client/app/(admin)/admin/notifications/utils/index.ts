import { CreatePushNotificationType, NotificationCreateDto } from '@js-monorepo/types/notifications'
import { apiClient } from '@js-monorepo/utils/http'

export const submitNotification = async (payload: NotificationCreateDto) => {
  return apiClient.post(`/notifications`, payload)
}

export const submitPushNotification = async (payload: CreatePushNotificationType) => {
  return apiClient.post('/notifications/push-notification', payload)
}
