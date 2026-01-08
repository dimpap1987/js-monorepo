import { RedisPushSubscriptionsKey } from '@js-monorepo/auth/nest/common/types'
import { ApiException } from '@js-monorepo/nest/exceptions'
import { REDIS } from '@js-monorepo/nest/redis'
import {
  CreateUserNotificationType,
  CursorPagination,
  NotificationCreateDto,
  Pageable,
  UserNotificationType,
} from '@js-monorepo/types'
import { tryCatch } from '@js-monorepo/utils/common'
import { Transactional } from '@nestjs-cls/transactional'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { RedisClientType } from '@redis/client'
import sanitizeHtml from 'sanitize-html'
import { sendNotification, setVapidDetails } from 'web-push'
import { NotificationRepo, NotificationRepository } from './notification.repository'
import { NotificationModuleOptions } from './notifications.module'

interface Subscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  updatedAt: string
  createdAt: string
}

interface UserSubscription {
  endpoint: string
  subscription: Subscription
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)

  constructor(
    @Inject(NotificationRepo)
    private notificationRepository: NotificationRepository,
    @Inject(REDIS) private readonly redis: RedisClientType,
    @Inject(RedisPushSubscriptionsKey) private readonly pushSubscriptionsKey: string,
    @Inject('NOTIFICATION_OPTIONS')
    private readonly notificationModuleOptions: NotificationModuleOptions
  ) {
    setVapidDetails(
      `mailto:${this.notificationModuleOptions.adminEmail}`,
      this.notificationModuleOptions.vapidPublicKey,
      this.notificationModuleOptions.vapidPrivateKey
    )
  }

  async saveUserSubscription(userId: number, subscription: any): Promise<void> {
    const redisKey = this.pushSubscriptionsKey + userId

    // Validate subscription object
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      throw new Error('Invalid subscription object')
    }

    const currentTime = new Date().toISOString()
    const value = JSON.stringify({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      updatedAt: currentTime,
      createdAt: currentTime,
    })

    try {
      await this.redis.hSet(redisKey, subscription.endpoint, value)
      await this.redis.expire(redisKey, 3600 * 24 * 3) // Set expiration to 3 days
    } catch (error) {
      this.logger.error('Error saving user subscription:', error.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_SAVE_USER_SUBSCRIPTION')
    }
  }

  async getUserSubscriptions(userId: number): Promise<UserSubscription[] | null> {
    const redisKey = this.pushSubscriptionsKey + userId

    const subscriptionsData = await this.redis.hGetAll(redisKey)

    if (!subscriptionsData || Object.keys(subscriptionsData).length === 0) return null

    return Object.keys(subscriptionsData).map((endpoint) => ({
      endpoint,
      subscription: JSON.parse(subscriptionsData[endpoint]),
    }))
  }

  async sendPushNotification(
    userIds: number[],
    payload: { title: string; message: string } & Record<string, any>
  ): Promise<void> {
    try {
      const subscriptionPromises = userIds.map(async (userId) => {
        const subscriptions = await this.getUserSubscriptions(userId)

        if (!subscriptions) {
          this.logger.log(`No subscriptions found for user ${userId}`)
          return []
        }

        return subscriptions.map(({ subscription }) => subscription)
      })

      const allSubscriptions = await Promise.all(subscriptionPromises)

      const allSubscriptionsFlattened = allSubscriptions.flat()

      if (allSubscriptionsFlattened.length === 0) {
        this.logger.log('No subscriptions to send notifications to.')
        return
      }

      const sendNotificationPromises = allSubscriptionsFlattened.map((subscription) => {
        if (!subscription?.endpoint) {
          throw new Error('Subscription is missing endpoint')
        }
        return sendNotification(subscription, JSON.stringify(payload))
      })

      await Promise.all(sendNotificationPromises)
      this.logger.log('Notifications sent successfully to all users!')
    } catch (error) {
      this.logger.error('Error sending notifications:', error.stack)
    }
  }

  async createNotification(payload: NotificationCreateDto) {
    this.logger.debug(`Creating new notification - Sender is : '${payload.senderId}'`)
    const sanitizedMessage = sanitizeHtml(payload.message)
    const not = await this.notificationRepository.createNotification({
      ...payload,
      message: sanitizedMessage,
    })

    tryCatch(() => {
      this.notificationModuleOptions.onNotificationCreation?.(payload.receiverIds, {
        ...not.notification,
      })
    })

    return not
  }

  @Transactional()
  async markAsRead(notificationId: number, userId: number) {
    return this.notificationRepository.markAsRead(notificationId, userId)
  }

  @Transactional()
  async markAllAsRead(userId: number) {
    return this.notificationRepository.markAllAsRead(userId)
  }

  @Transactional()
  async archiveNotification(notificationId: number) {
    return this.notificationRepository.archiveNotification(notificationId)
  }

  @Transactional()
  async getNotifications(userId: number, pageable: Pageable) {
    return this.notificationRepository.getNotifications(userId, pageable)
  }

  @Transactional()
  async getNotificationsByCursor(userId: number, cursorPagination: CursorPagination) {
    return this.notificationRepository.getNotificationsByCursor(userId, cursorPagination)
  }

  async getTotalUnreadNotifications(userId: number): Promise<number> {
    return this.notificationRepository.getTotalUnreadNotifications(userId)
  }

  notificationToPresenceMessage(data: CreateUserNotificationType): UserNotificationType {
    return {
      notification: {
        id: data?.id,
        createdAt: data?.createdAt,
        message: data?.message,
      },
      isRead: false,
    }
  }
}
