import {
  CreateUserNotificationType,
  NotificationCreateDto,
  Pageable,
  UserNotificationType,
} from '@js-monorepo/types'
import { UserPresenceWebsocketService } from '@js-monorepo/user-presence'
import { Transactional } from '@nestjs-cls/transactional'
import { Inject, Injectable, Logger } from '@nestjs/common'
import {
  NotificationRepo,
  NotificationRepository,
} from './notification.repository'

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)

  constructor(
    @Inject(NotificationRepo)
    private notificationRepository: NotificationRepository,
    private readonly userPresenceWebsocketService: UserPresenceWebsocketService
  ) {}

  @Transactional()
  async createNotification(payload: NotificationCreateDto) {
    this.logger.debug(
      `Creating new notification - Sender is : '${payload.senderId}'`
    )
    const notification =
      await this.notificationRepository.createNotification(payload)

    this.userPresenceWebsocketService.sendToUsers(
      payload.receiverIds,
      'events:notifications',
      { data: this.transformSelect(notification) }
    )
  }

  @Transactional()
  async markAsRead(notificationId: number, userId: number) {
    return this.notificationRepository.markAsRead(notificationId, userId)
  }

  @Transactional()
  async archiveNotification(notificationId: number) {
    return this.notificationRepository.archiveNotification(notificationId)
  }

  @Transactional()
  async getNotifications(userId: number, pageable: Pageable) {
    return this.notificationRepository.getNotifications(userId, pageable)
  }

  async getTotalUnreadNotifications(userId: number): Promise<number> {
    return this.notificationRepository.getTotalUnreadNotifications(userId)
  }

  private transformSelect(
    data: CreateUserNotificationType
  ): UserNotificationType {
    return {
      notification: {
        id: data?.id,
        createdAt: data?.createdAt,
        message: data?.message,
      },
      isRead: false,
      sender: {
        id: data?.userNotification[0]?.sender?.id,
        username: data?.userNotification[0]?.sender?.username,
      },
    }
  }
}
