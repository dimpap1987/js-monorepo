import { PrismaService } from '@js-monorepo/db'
import { NotificationCreateDto } from '@js-monorepo/types'
import { Injectable } from '@nestjs/common'
import { NotificationRepository } from '../../interfaces/notification.repository'

@Injectable()
export class NotificationRepositoryPrisma implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(payload: NotificationCreateDto): Promise<void> {
    const { message, type, link, additionalData, senderId, receiverId } =
      payload

    await this.prisma.notification.create({
      data: {
        message,
        type,
        additionalData: additionalData,
        link,
        userNotification: {
          create: {
            user: { connect: { id: receiverId } },
            sender: senderId ? { connect: { id: senderId } } : undefined,
          },
        },
      },
    })
  }
}
