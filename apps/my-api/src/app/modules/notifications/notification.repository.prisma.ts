import { NotificationCreateDto, Pageable } from '@js-monorepo/types'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { NotificationRepository } from './notification.repository'

@Injectable()
export class NotificationRepositoryPrisma implements NotificationRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>
  ) {}

  async getNotifications(
    userId: number,
    pageable: Pageable = {
      page: 1,
      pageSize: 10,
    }
  ) {
    const { page, pageSize } = pageable
    const totalNotifications = await this.txHost.tx.userNotification.count({
      where: { receiverId: userId },
    })

    const unreadTotal = await this.getTotalUnreadNotifications(userId)

    const notifications = await this.txHost.tx.userNotification.findMany({
      where: { receiverId: userId },
      select: {
        notification: {
          select: {
            id: true,
            isArchived: true,
            createdAt: true,
            message: true,
          },
        },
        isRead: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        notification: {
          id: 'desc', // Sort by notification id in descending order
        },
      },
      skip: (page - 1) * pageSize, // Skip records for pagination
      take: pageSize, // Limit to pageSize records
    })

    return {
      totalCount: totalNotifications, // Total number of notifications
      content: notifications, // Paginated notifications
      page: page, // Current page number
      pageSize, // Size of each page
      totalPages: Math.ceil(totalNotifications / pageSize), // Total number of pages
      unReadTotal: unreadTotal,
    }
  }

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
            sender: { connect: { id: senderId } },
          },
        },
      },
      select: {
        id: true,
      },
    })
  }

  async markAsRead(notificationId: number, userId: number) {
    return this.txHost.tx.userNotification.updateMany({
      where: {
        notificationId,
        receiverId: userId,
      },
      data: { isRead: true },
    })
  }

  async archiveNotification(notificationId: number) {
    return this.txHost.tx.notification.update({
      where: { id: notificationId },
      data: { isArchived: true },
      select: {
        id: true,
      },
    })
  }

  async getTotalUnreadNotifications(userId: number): Promise<number> {
    return this.txHost.tx.userNotification.count({
      where: {
        receiverId: userId,
        isRead: false, // Filter for unread notifications
      },
    })
  }
}
