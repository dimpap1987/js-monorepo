import {
  NotificationCreateDto,
  Pageable,
  PaginationType,
} from '@js-monorepo/types'
import { Prisma } from '@prisma/client'

export const NotificationRepo = Symbol()

export interface NotificationRepository {
  createNotification(payload: NotificationCreateDto): Promise<{ id: number }>
  getNotifications(
    userId: number,
    pageable: Pageable
  ): Promise<PaginationType & { unReadTotal?: number }>
  markAsRead(
    notificationId: number,
    userId: number
  ): Promise<Prisma.BatchPayload>
  archiveNotification(notificationId: number): Promise<{ id: number }>
  getTotalUnreadNotifications(userId: number): Promise<number>
}
