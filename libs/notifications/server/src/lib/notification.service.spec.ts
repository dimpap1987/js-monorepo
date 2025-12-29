import { RedisPushSubscriptionsKey } from '@js-monorepo/auth/nest/common/types'
import { ApiException } from '@js-monorepo/nest/exceptions'
import { REDIS } from '@js-monorepo/nest/redis'
import { NotificationCreateDto } from '@js-monorepo/types'
import { Test, TestingModule } from '@nestjs/testing'
import { RedisClientType } from '@redis/client'
import { NotificationService } from './notification.service'
import { NotificationRepo, NotificationRepository } from './notification.repository'
import { NotificationModuleOptions } from './notifications.module'

// Mock web-push
jest.mock('web-push', () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn().mockResolvedValue(undefined),
}))

// Mock @Transactional decorator to be a no-op
jest.mock('@nestjs-cls/transactional', () => {
  const actual = jest.requireActual('@nestjs-cls/transactional')
  return {
    ...actual,
    Transactional: () => {
      return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        // Return descriptor as-is without wrapping
        return descriptor
      }
    },
  }
})

describe('NotificationService', () => {
  let service: NotificationService
  let mockRepository: jest.Mocked<NotificationRepository>
  let mockRedis: jest.Mocked<RedisClientType>
  let mockOptions: NotificationModuleOptions

  beforeEach(async () => {
    mockRepository = {
      createNotification: jest.fn(),
      getNotifications: jest.fn(),
      getNotificationsByCursor: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      archiveNotification: jest.fn(),
      getTotalUnreadNotifications: jest.fn(),
    } as any

    mockRedis = {
      hSet: jest.fn(),
      hGetAll: jest.fn(),
      expire: jest.fn(),
    } as any

    mockOptions = {
      adminEmail: 'admin@example.com',
      vapidPublicKey: 'public-key',
      vapidPrivateKey: 'private-key',
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: NotificationRepo,
          useValue: mockRepository,
        },
        {
          provide: REDIS,
          useValue: mockRedis,
        },
        {
          provide: RedisPushSubscriptionsKey,
          useValue: 'test:push_subscription:user:',
        },
        {
          provide: 'NOTIFICATION_OPTIONS',
          useValue: mockOptions,
        },
      ],
    }).compile()

    service = module.get<NotificationService>(NotificationService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('saveUserSubscription', () => {
    it('should save user subscription successfully', async () => {
      const userId = 1
      const subscription = {
        endpoint: 'https://example.com/endpoint',
        keys: {
          p256dh: 'p256dh-key',
          auth: 'auth-key',
        },
      }

      mockRedis.hSet.mockResolvedValue(1)
      mockRedis.expire.mockResolvedValue(true)

      await service.saveUserSubscription(userId, subscription)

      expect(mockRedis.hSet).toHaveBeenCalledWith(
        'test:push_subscription:user:1',
        subscription.endpoint,
        expect.stringContaining(subscription.endpoint)
      )
      expect(mockRedis.expire).toHaveBeenCalledWith('test:push_subscription:user:1', 3600 * 24 * 3)
    })

    it('should throw error for invalid subscription', async () => {
      const userId = 1
      const invalidSubscription = { endpoint: 'https://example.com' }

      await expect(service.saveUserSubscription(userId, invalidSubscription as any)).rejects.toThrow(
        'Invalid subscription object'
      )
    })

    it('should throw ApiException on Redis error', async () => {
      const userId = 1
      const subscription = {
        endpoint: 'https://example.com/endpoint',
        keys: {
          p256dh: 'p256dh-key',
          auth: 'auth-key',
        },
      }

      mockRedis.hSet.mockRejectedValue(new Error('Redis error'))

      await expect(service.saveUserSubscription(userId, subscription)).rejects.toThrow(ApiException)
    })
  })

  describe('getUserSubscriptions', () => {
    it('should return user subscriptions', async () => {
      const userId = 1
      const subscriptionData = {
        endpoint1: JSON.stringify({
          endpoint: 'endpoint1',
          keys: { p256dh: 'key1', auth: 'auth1' },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        }),
        endpoint2: JSON.stringify({
          endpoint: 'endpoint2',
          keys: { p256dh: 'key2', auth: 'auth2' },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        }),
      }

      mockRedis.hGetAll.mockResolvedValue(subscriptionData as any)

      const result = await service.getUserSubscriptions(userId)

      expect(result).toHaveLength(2)
      expect(result?.[0]?.endpoint).toBe('endpoint1')
      expect(result?.[1]?.endpoint).toBe('endpoint2')
    })

    it('should return null when no subscriptions found', async () => {
      const userId = 1
      mockRedis.hGetAll.mockResolvedValue({} as any)

      const result = await service.getUserSubscriptions(userId)

      expect(result).toBeNull()
    })
  })

  describe('sendPushNotification', () => {
    it('should send push notifications to all users', async () => {
      const userIds = [1, 2]
      const payload = { title: 'Test', message: 'Test message' }

      const webPush = await import('web-push')
      const { sendNotification } = webPush

      mockRedis.hGetAll
        .mockResolvedValueOnce({
          endpoint1: JSON.stringify({
            endpoint: 'endpoint1',
            keys: { p256dh: 'key1', auth: 'auth1' },
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          }),
        } as any)
        .mockResolvedValueOnce({
          endpoint2: JSON.stringify({
            endpoint: 'endpoint2',
            keys: { p256dh: 'key2', auth: 'auth2' },
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          }),
        } as any)

      await service.sendPushNotification(userIds, payload)

      expect(sendNotification).toHaveBeenCalledTimes(2)
    })

    it('should handle users with no subscriptions', async () => {
      const userIds = [1, 2]
      const payload = { title: 'Test', message: 'Test message' }

      mockRedis.hGetAll.mockResolvedValue({} as any)

      await service.sendPushNotification(userIds, payload)

      expect(mockRedis.hGetAll).toHaveBeenCalledTimes(2)
    })

    it('should handle errors gracefully', async () => {
      const userIds = [1]
      const payload = { title: 'Test', message: 'Test message' }

      mockRedis.hGetAll.mockRejectedValue(new Error('Redis error'))

      await expect(service.sendPushNotification(userIds, payload)).resolves.not.toThrow()
    })
  })

  describe('createNotification', () => {
    it('should create notification successfully', async () => {
      const payload: NotificationCreateDto = {
        senderId: 1,
        receiverIds: [2, 3],
        message: '<script>alert("xss")</script>Safe message',
      }

      const mockResult = {
        notification: {
          id: 1,
          message: 'Safe message',
          createdAt: new Date(),
        },
        total: 2,
      }

      mockRepository.createNotification.mockResolvedValue(mockResult as any)

      const result = await service.createNotification(payload)

      expect(mockRepository.createNotification).toHaveBeenCalledWith({
        ...payload,
        message: 'Safe message', // Sanitized
      })
      expect(result).toEqual(mockResult)
    })

    it('should call onNotificationCreation callback if provided', async () => {
      const callback = jest.fn()
      mockOptions.onNotificationCreation = callback

      const payload: NotificationCreateDto = {
        senderId: 1,
        receiverIds: [2, 3],
        message: 'Test message',
      }

      const mockResult = {
        notification: {
          id: 1,
          message: 'Test message',
          createdAt: new Date(),
        },
        total: 2,
      }

      mockRepository.createNotification.mockResolvedValue(mockResult as any)

      await service.createNotification(payload)

      expect(callback).toHaveBeenCalledWith([2, 3], mockResult.notification)
    })
  })

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notificationId = 1
      const userId = 2
      const mockResult = { count: 1 }

      mockRepository.markAsRead.mockResolvedValue(mockResult as any)

      const result = await service.markAsRead(notificationId, userId)

      expect(mockRepository.markAsRead).toHaveBeenCalledWith(notificationId, userId)
      expect(result).toEqual(mockResult)
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const userId = 1
      const mockResult = { count: 5 }

      mockRepository.markAllAsRead.mockResolvedValue(mockResult as any)

      const result = await service.markAllAsRead(userId)

      expect(mockRepository.markAllAsRead).toHaveBeenCalledWith(userId)
      expect(result).toEqual(mockResult)
    })
  })

  describe('archiveNotification', () => {
    it('should archive notification', async () => {
      const notificationId = 1
      const mockResult = { id: notificationId }

      mockRepository.archiveNotification.mockResolvedValue(mockResult)

      const result = await service.archiveNotification(notificationId)

      expect(mockRepository.archiveNotification).toHaveBeenCalledWith(notificationId)
      expect(result).toEqual(mockResult)
    })
  })

  describe('getNotifications', () => {
    it('should get notifications with pagination', async () => {
      const userId = 1
      const pageable = { page: 1, pageSize: 10 }
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        unReadTotal: 0,
      }

      mockRepository.getNotifications.mockResolvedValue(mockResult as any)

      const result = await service.getNotifications(userId, pageable)

      expect(mockRepository.getNotifications).toHaveBeenCalledWith(userId, pageable)
      expect(result).toEqual(mockResult)
    })
  })

  describe('getNotificationsByCursor', () => {
    it('should get notifications with cursor-based pagination', async () => {
      const userId = 1
      const cursorPagination = { cursor: 100, limit: 15 }
      const mockResult = {
        content: [],
        nextCursor: 85,
        hasMore: true,
        limit: 15,
        unReadTotal: 2,
      }

      mockRepository.getNotificationsByCursor.mockResolvedValue(mockResult as any)

      const result = await service.getNotificationsByCursor(userId, cursorPagination)

      expect(mockRepository.getNotificationsByCursor).toHaveBeenCalledWith(userId, cursorPagination)
      expect(result).toEqual(mockResult)
    })

    it('should handle null cursor', async () => {
      const userId = 1
      const cursorPagination = { cursor: null, limit: 15 }
      const mockResult = {
        content: [],
        nextCursor: 85,
        hasMore: true,
        limit: 15,
        unReadTotal: 2,
      }

      mockRepository.getNotificationsByCursor.mockResolvedValue(mockResult as any)

      const result = await service.getNotificationsByCursor(userId, cursorPagination)

      expect(mockRepository.getNotificationsByCursor).toHaveBeenCalledWith(userId, cursorPagination)
      expect(result).toEqual(mockResult)
    })
  })

  describe('getTotalUnreadNotifications', () => {
    it('should return total unread notifications count', async () => {
      const userId = 1
      const mockCount = 5

      mockRepository.getTotalUnreadNotifications.mockResolvedValue(mockCount)

      const result = await service.getTotalUnreadNotifications(userId)

      expect(mockRepository.getTotalUnreadNotifications).toHaveBeenCalledWith(userId)
      expect(result).toBe(mockCount)
    })
  })

  describe('notificationToPresenceMessage', () => {
    it('should convert notification to presence message', () => {
      const data = {
        id: 1,
        message: 'Test message',
        createdAt: new Date(),
      }

      const result = service.notificationToPresenceMessage(data as any)

      expect(result).toEqual({
        notification: {
          id: 1,
          message: 'Test message',
          createdAt: data.createdAt,
        },
        isRead: false,
      })
    })
  })
})
