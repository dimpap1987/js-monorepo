import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async createNotification(
    message: string,
    type: string | null,
    additionalData: Record<string, any> | null,
    link: string | null,
    userId: number,
    senderId: number
  ) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          message,
          type,
          additional_data: additionalData,
          link,
          userNotification: {
            create: {
              user: { connect: { id: userId } },
              sender: senderId ? { connect: { id: senderId } } : undefined,
            },
          },
        },
        include: { userNotification: true }, // Include the userNotification relation in the response
      })

      return notification
    } catch (error) {
      console.error('Error creating notification:', error)
      throw new Error('Failed to create notification')
    }
  }
}
