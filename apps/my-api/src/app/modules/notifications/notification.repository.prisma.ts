import { NotificationCreateDto } from '@js-monorepo/types'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { NotificationRepository } from './notification.repository'

@Injectable()
export class NotificationRepositoryPrisma implements NotificationRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>
  ) {}

  async createNotification(
    payload: NotificationCreateDto
  ): Promise<{ id: number }> {
    const { message, type, link, additionalData, senderId, receiverId } =
      payload

    return this.txHost.tx.notification.create({
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
      select: {
        id: true,
      },
    })
  }
}
