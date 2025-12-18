import { HasRoles } from '@js-monorepo/auth/nest/common'
import { RolesEnum } from '@js-monorepo/auth/nest/common/types'
import { LoggedInGuard, RolesGuard, SessionUser } from '@js-monorepo/auth/nest/session'
import { ApiException } from '@js-monorepo/nest/exceptions'
import { CreatePushNotificationType, NotificationCreateDto } from '@js-monorepo/types'
import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { NotificationController } from './notification.controller'
import { NotificationService } from './notification.service'

describe('NotificationController', () => {
  let controller: NotificationController
  let service: jest.Mocked<NotificationService>
  let configService: jest.Mocked<ConfigService>

  beforeEach(async () => {
    const mockService = {
      createNotification: jest.fn(),
      getNotifications: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      archiveNotification: jest.fn(),
      saveUserSubscription: jest.fn(),
      sendPushNotification: jest.fn(),
    }

    const mockConfigService = {
      get: jest.fn().mockReturnValue('http://localhost:3000'),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    })
      .overrideGuard(LoggedInGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<NotificationController>(NotificationController)
    service = module.get(NotificationService)
    configService = module.get(ConfigService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createNotification', () => {
    it('should create notification successfully', async () => {
      const payload: NotificationCreateDto = {
        senderId: 1,
        receiverIds: [2, 3],
        message: 'Test message',
      }

      const mockResult = {
        notification: { id: 1, message: 'Test message', createdAt: new Date() },
        total: 2,
      }

      service.createNotification.mockResolvedValue(mockResult as any)

      await controller.createNotification(payload)

      expect(service.createNotification).toHaveBeenCalledWith(payload)
    })

    it('should throw ApiException on error', async () => {
      const payload: NotificationCreateDto = {
        senderId: 1,
        receiverIds: [2, 3],
        message: 'Test message',
      }

      service.createNotification.mockRejectedValue(new Error('Database error'))

      await expect(controller.createNotification(payload)).rejects.toThrow(ApiException)
    })
  })

  describe('getNotifications', () => {
    it('should get notifications for user', async () => {
      const sessionUser = { id: 1, isAdmin: false }
      const userId = 1
      const page = 1
      const pageSize = 10

      const mockResult = {
        totalCount: 5,
        content: [],
        page: 1,
        pageSize: 10,
        totalPages: 1,
        unReadTotal: 2,
      }

      service.getNotifications.mockResolvedValue(mockResult as any)

      const result = await controller.getNotifications(sessionUser as any, userId, page, pageSize)

      expect(service.getNotifications).toHaveBeenCalledWith(userId, { page, pageSize })
      expect(result).toEqual(mockResult)
    })

    it('should allow admin to get notifications for any user', async () => {
      const sessionUser = { id: 1, isAdmin: true }
      const userId = 2
      const page = 1
      const pageSize = 10

      const mockResult = {
        totalCount: 3,
        content: [],
        page: 1,
        pageSize: 10,
        totalPages: 1,
        unReadTotal: 1,
      }

      service.getNotifications.mockResolvedValue(mockResult as any)

      const result = await controller.getNotifications(sessionUser as any, userId, page, pageSize)

      expect(service.getNotifications).toHaveBeenCalledWith(userId, { page, pageSize })
      expect(result).toEqual(mockResult)
    })

    it('should throw FORBIDDEN when non-admin tries to access another user notifications', async () => {
      const sessionUser = { id: 1, isAdmin: false }
      const userId = 2

      await expect(controller.getNotifications(sessionUser as any, userId, 1, 10)).rejects.toThrow(ApiException)
    })
  })

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notificationId = 1
      const sessionUser = { id: 2 }

      service.markAsRead.mockResolvedValue(undefined)

      await controller.markAsRead(notificationId, sessionUser as any)

      expect(service.markAsRead).toHaveBeenCalledWith(notificationId, sessionUser.id)
    })

    it('should handle errors gracefully', async () => {
      const notificationId = 1
      const sessionUser = { id: 2 }

      service.markAsRead.mockRejectedValue(new Error('Database error'))

      await expect(controller.markAsRead(notificationId, sessionUser as any)).resolves.not.toThrow()
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const sessionUser = { id: 1 }

      service.markAllAsRead.mockResolvedValue(undefined)

      await controller.markAllAsRead(sessionUser as any)

      expect(service.markAllAsRead).toHaveBeenCalledWith(sessionUser.id)
    })

    it('should throw ApiException on error', async () => {
      const sessionUser = { id: 1 }

      service.markAllAsRead.mockRejectedValue(new Error('Database error'))

      await expect(controller.markAllAsRead(sessionUser as any)).rejects.toThrow(ApiException)
    })
  })

  describe('archiveNotification', () => {
    it('should archive notification', async () => {
      const notificationId = 1

      service.archiveNotification.mockResolvedValue({ id: notificationId })

      await controller.archiveNotification(notificationId)

      expect(service.archiveNotification).toHaveBeenCalledWith(notificationId)
    })

    it('should throw ApiException on error', async () => {
      const notificationId = 1

      service.archiveNotification.mockRejectedValue(new Error('Database error'))

      await expect(controller.archiveNotification(notificationId)).rejects.toThrow(ApiException)
    })
  })

  describe('subscribeUser', () => {
    it('should save user subscription', async () => {
      const userId = 1
      const subscription = {
        endpoint: 'https://example.com/endpoint',
        keys: {
          p256dh: 'p256dh-key',
          auth: 'auth-key',
        },
      }

      service.saveUserSubscription.mockResolvedValue(undefined)

      await controller.subscribeUser(userId, subscription)

      expect(service.saveUserSubscription).toHaveBeenCalledWith(userId, subscription)
    })

    it('should throw ApiException for invalid subscription', async () => {
      const userId = 1
      const invalidSubscription = { endpoint: 'https://example.com' }

      await expect(controller.subscribeUser(userId, invalidSubscription as any)).rejects.toThrow(ApiException)
    })
  })

  describe('sendPushNotification', () => {
    it('should send push notification to users', async () => {
      const payload: CreatePushNotificationType = {
        receiverIds: [1, 2, 3],
        title: 'Test Title',
        message: 'Test Message',
      }

      service.sendPushNotification.mockResolvedValue(undefined)

      await controller.sendPushNotification(payload)

      expect(service.sendPushNotification).toHaveBeenCalledWith(payload.receiverIds, {
        title: payload.title,
        message: payload.message,
        data: {
          url: 'http://localhost:3000',
        },
      })
    })

    it('should throw ApiException on error', async () => {
      const payload: CreatePushNotificationType = {
        receiverIds: [1, 2],
        title: 'Test Title',
        message: 'Test Message',
      }

      service.sendPushNotification.mockRejectedValue(new Error('Push notification error'))

      await expect(controller.sendPushNotification(payload)).rejects.toThrow(ApiException)
    })
  })
})
