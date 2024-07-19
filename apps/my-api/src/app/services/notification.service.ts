import { Inject, Injectable, Logger } from '@nestjs/common'
import { NotificationRepository } from '../repositories/interfaces/notification.repository'

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)

  constructor(
    @Inject('NOTIFICATION_REPOSITORY')
    private notificationRepository: NotificationRepository
  ) {}

  async createNotification(
    message: string,
    type: string | null,
    additionalData: Record<string, any> | null,
    link: string | null,
    receiverId: number,
    senderId: number
  ) {
    try {
      this.logger.debug(`Creating new notification - Sender is : '${senderId}'`)
      await this.notificationRepository.createNotification({
        message,
        receiverId,
        senderId,
        link,
        type,
        additionalData,
      })
    } catch (error) {
      this.logger.error('Error creating notification:', error)
      throw new Error('Failed to create notification')
    }
  }
}
