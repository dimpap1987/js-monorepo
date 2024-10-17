import { NotificationCreateDto } from '@js-monorepo/types'

export const NotificationRepo = Symbol()

export interface NotificationRepository {
  createNotification(payload: NotificationCreateDto): Promise<{ id: number }>
}
