import { NotificationCreateDto, Pageable } from '@js-monorepo/types'
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
    private notificationRepository: NotificationRepository
  ) {}

  @Transactional()
  async createNotification(payload: NotificationCreateDto) {
    this.logger.debug(
      `Creating new notification - Sender is : '${payload.senderId}'`
    )
    return this.notificationRepository.createNotification(payload)
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
}
