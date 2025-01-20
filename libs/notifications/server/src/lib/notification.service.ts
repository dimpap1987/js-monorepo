import { ApiException } from '@js-monorepo/nest/exceptions'
import { REDIS } from '@js-monorepo/nest/redis'
import {
  CreateUserNotificationType,
  NotificationCreateDto,
  Pageable,
  UserNotificationType,
} from '@js-monorepo/types'
import { Transactional } from '@nestjs-cls/transactional'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { RedisClientType } from '@redis/client'
import { sendNotification, setVapidDetails } from 'web-push'
import {
  NotificationRepo,
  NotificationRepository,
} from './notification.repository'
import { NotificationModuleOptions } from './notifications.module'
import { tryCatch } from '@js-monorepo/utils/common'

export interface Subscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  updatedAt: string
  createdAt: string
}

export interface UserSubscription {
  endpoint: string
  subscription: Subscription
}

export const getUserSubscriptionRedisKey = (userId: number) =>
  `${process.env['REDIS_NAMESPACE']}:push_subscription:user:${userId}`

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)

  private readonly vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
  }

  constructor(
    @Inject(NotificationRepo)
    private notificationRepository: NotificationRepository,
    @Inject(REDIS) private readonly redis: RedisClientType,
    @Inject('NOTIFICATION_OPTIONS')
    private readonly notificationModuleOptions: NotificationModuleOptions
  ) {
    setVapidDetails(
      `mailto:${process.env.ADMIN_EMAIL}`,
      this.vapidKeys.publicKey,
      this.vapidKeys.privateKey
    )
  }

  async saveUserSubscription(userId: number, subscription: any): Promise<void> {
    const redisKey = getUserSubscriptionRedisKey(userId)

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
      console.error('Error saving user subscription:', error)
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'ERROR_SAVE_USER_SUBSCRIPTION'
      )
    }
  }

  async getUserSubscriptions(
    userId: number
  ): Promise<UserSubscription[] | null> {
    const redisKey = getUserSubscriptionRedisKey(userId)

    const subscriptionsData = await this.redis.hGetAll(redisKey)

    if (!subscriptionsData || Object.keys(subscriptionsData).length === 0)
      return null

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
          console.log(`No subscriptions found for user ${userId}`)
          return []
        }

        return subscriptions.map(({ subscription }) => subscription)
      })

      const allSubscriptions = await Promise.all(subscriptionPromises)

      const allSubscriptionsFlattened = allSubscriptions.flat()

      if (allSubscriptionsFlattened.length === 0) {
        console.log('No subscriptions to send notifications to.')
        return
      }

      const sendNotificationPromises = allSubscriptionsFlattened.map(
        (subscription) => {
          if (!subscription?.endpoint) {
            throw new Error('Subscription is missing endpoint')
          }
          return sendNotification(subscription, JSON.stringify(payload))
        }
      )

      await Promise.all(sendNotificationPromises)
      console.log('Notifications sent successfully to all users!')
    } catch (error) {
      console.error('Error sending notifications:', error)
    }
  }

  @Transactional()
  async createNotification(payload: NotificationCreateDto) {
    this.logger.debug(
      `Creating new notification - Sender is : '${payload.senderId}'`
    )
    const not = await this.notificationRepository.createNotification(payload)

    tryCatch(() => {
      this.notificationModuleOptions.onNotificationCreation?.(
        payload.receiverIds,
        {
          ...not.notification,
        }
      )
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

  async getTotalUnreadNotifications(userId: number): Promise<number> {
    return this.notificationRepository.getTotalUnreadNotifications(userId)
  }

  notificationToPresenceMessage(
    data: CreateUserNotificationType
  ): UserNotificationType {
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
