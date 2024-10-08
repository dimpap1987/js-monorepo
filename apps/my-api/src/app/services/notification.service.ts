import { Inject, Injectable, Logger } from '@nestjs/common'
import { NotificationRepository } from '../repositories/interfaces/notification.repository'
import { NotificationRepo } from '../types'

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)

  constructor(
    @Inject(NotificationRepo)
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
    this.logger.debug(`Creating new notification - Sender is : '${senderId}'`)
    return this.notificationRepository.createNotification({
      message,
      receiverId,
      senderId,
      link,
      type,
      additionalData,
    })
  }
}
