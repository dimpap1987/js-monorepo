import { CreateUserNotificationType, NotificationCreateDto } from '@js-monorepo/types/notifications'
import { CursorPagination, CursorPaginationType, Pageable, PaginationType } from '@js-monorepo/types/pagination'
import { Prisma } from '@js-monorepo/db'

export const NotificationRepo = Symbol()

export interface NotificationRepository {
  createNotification(payload: NotificationCreateDto): Promise<{
    notification: CreateUserNotificationType
    total: number
  }>
  getNotifications(userId: number, pageable: Pageable): Promise<PaginationType & { unReadTotal?: number }>
  getNotificationsByCursor(
    userId: number,
    cursorPagination: CursorPagination
  ): Promise<CursorPaginationType & { unReadTotal?: number }>
  markAsRead(notificationId: number, userId: number): Promise<Prisma.BatchPayload>
  markAllAsRead(userId: number): Promise<Prisma.BatchPayload>
  archiveNotification(notificationId: number): Promise<{ id: number }>
  getTotalUnreadNotifications(userId: number): Promise<number>
}
