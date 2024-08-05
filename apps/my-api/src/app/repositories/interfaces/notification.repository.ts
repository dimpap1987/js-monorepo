import { NotificationCreateDto } from '@js-monorepo/types'

export interface NotificationRepository {
  createNotification(payload: NotificationCreateDto): Promise<void>
}
