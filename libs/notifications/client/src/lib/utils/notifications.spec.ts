// @ts-expect-error - Jest resolves this path alias correctly at runtime
import { UserNotificationType } from '@js-monorepo/types'
import {
  apiFetchUserNotifications,
  apiReadAllNotifications,
  apiReadNotification,
  humanatizeNotificationDate,
  updateNotificationAsRead,
} from './notifications'
// @ts-expect-error - Jest resolves this path alias correctly at runtime
import { apiClient } from '@js-monorepo/utils/http'

// Mock the apiClient
jest.mock('@js-monorepo/utils/http', () => ({
  apiClient: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}))

describe('notifications utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('updateNotificationAsRead', () => {
    it('should mark a notification as read by id', () => {
      const notifications: UserNotificationType[] = [
        {
          notification: { id: 1, message: 'Test 1', createdAt: new Date() },
          isRead: false,
        },
        {
          notification: { id: 2, message: 'Test 2', createdAt: new Date() },
          isRead: false,
        },
        {
          notification: { id: 3, message: 'Test 3', createdAt: new Date() },
          isRead: false,
        },
      ]

      const result = updateNotificationAsRead(notifications, 2)

      expect(result[0].isRead).toBe(false)
      expect(result[1].isRead).toBe(true)
      expect(result[2].isRead).toBe(false)
    })

    it('should not modify notifications if id is not found', () => {
      const notifications: UserNotificationType[] = [
        {
          notification: { id: 1, message: 'Test 1', createdAt: new Date() },
          isRead: false,
        },
      ]

      const result = updateNotificationAsRead(notifications, 999)

      expect(result[0].isRead).toBe(false)
    })

    it('should handle empty array', () => {
      const result = updateNotificationAsRead([], 1)
      expect(result).toEqual([])
    })

    it('should handle null/undefined notifications array', () => {
      const result1 = updateNotificationAsRead(null as any, 1)
      expect(result1).toBeUndefined()

      const result2 = updateNotificationAsRead(undefined as any, 1)
      expect(result2).toBeUndefined()
    })

    it('should handle multiple notifications with same id', () => {
      const notifications: UserNotificationType[] = [
        {
          notification: { id: 1, message: 'Test 1', createdAt: new Date() },
          isRead: false,
        },
        {
          notification: { id: 1, message: 'Test 1 duplicate', createdAt: new Date() },
          isRead: false,
        },
      ]

      const result = updateNotificationAsRead(notifications, 1)

      expect(result[0].isRead).toBe(true)
      expect(result[1].isRead).toBe(true)
    })

    it('should handle notifications with missing notification object', () => {
      const notifications: any[] = [
        {
          notification: { id: 1, message: 'Test 1', createdAt: new Date() },
          isRead: false,
        },
        {
          notification: null,
          isRead: false,
        },
        {
          isRead: false,
        },
      ]

      const result = updateNotificationAsRead(notifications, 1)

      expect(result[0].isRead).toBe(true)
      expect(result[1].isRead).toBe(false)
      expect(result[2].isRead).toBe(false)
    })

    it('should not modify already read notifications', () => {
      const notifications: UserNotificationType[] = [
        {
          notification: { id: 1, message: 'Test 1', createdAt: new Date() },
          isRead: true,
        },
        {
          notification: { id: 2, message: 'Test 2', createdAt: new Date() },
          isRead: false,
        },
      ]

      const result = updateNotificationAsRead(notifications, 1)

      expect(result[0].isRead).toBe(true)
      expect(result[1].isRead).toBe(false)
    })
  })

  describe('humanatizeNotificationDate', () => {
    it('should return humanized time difference for valid date', () => {
      const date = new Date()
      date.setMinutes(date.getMinutes() - 5)

      const result = humanatizeNotificationDate(date)

      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
      expect(result).not.toBe('Invalid date')
      expect(result).toContain('minute')
    })

    it('should return "Invalid date" for invalid date string', () => {
      const result = humanatizeNotificationDate('invalid-date')

      expect(result).toBe('Invalid date')
    })

    it('should return "Invalid date" for empty string', () => {
      const result = humanatizeNotificationDate('')

      expect(result).toBe('Invalid date')
    })

    it('should handle Date object', () => {
      const date = new Date('2020-01-01')
      const result = humanatizeNotificationDate(date)

      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should handle date string', () => {
      const dateString = '2024-01-01T00:00:00Z'
      const result = humanatizeNotificationDate(dateString)

      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should handle recent dates (seconds ago)', () => {
      const date = new Date()
      date.setSeconds(date.getSeconds() - 30)

      const result = humanatizeNotificationDate(date)

      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should handle dates from hours ago', () => {
      const date = new Date()
      date.setHours(date.getHours() - 2)

      const result = humanatizeNotificationDate(date)

      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
      expect(result.toLowerCase()).toContain('hour')
    })

    it('should handle dates from days ago', () => {
      const date = new Date()
      date.setDate(date.getDate() - 3)

      const result = humanatizeNotificationDate(date)

      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
      expect(result.toLowerCase()).toContain('day')
    })

    it('should handle dates from months ago', () => {
      const date = new Date()
      date.setMonth(date.getMonth() - 2)

      const result = humanatizeNotificationDate(date)

      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should handle null date', () => {
      const result = humanatizeNotificationDate(null as any)

      expect(result).toBe('Invalid date')
    })

    it('should handle undefined date', () => {
      // moment treats undefined as current time, so we check it returns a string
      const result = humanatizeNotificationDate(undefined as any)

      // moment may return a valid string for undefined, so we just check it's a string
      expect(typeof result).toBe('string')
    })
  })

  describe('apiFetchUserNotifications', () => {
    it('should call apiClient.get with correct URL and userId', async () => {
      const userId = 123
      const mockResponse = {
        content: [],
        page: 1,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        unReadTotal: 0,
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockResponse)

      const result = await apiFetchUserNotifications(userId)

      expect(apiClient.get).toHaveBeenCalledWith(`/notifications/users/${userId}`)
      expect(result).toEqual(mockResponse)
    })

    it('should include searchParams in URL when provided', async () => {
      const userId = 123
      const searchParams = '?page=2&pageSize=20'
      const mockResponse = {
        content: [],
        page: 2,
        pageSize: 20,
        totalElements: 0,
        totalPages: 0,
        unReadTotal: 0,
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockResponse)

      const result = await apiFetchUserNotifications(userId, searchParams)

      expect(apiClient.get).toHaveBeenCalledWith(`/notifications/users/${userId}${searchParams}`)
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const userId = 123
      const error = new Error('API Error')

      ;(apiClient.get as jest.Mock).mockRejectedValue(error)

      await expect(apiFetchUserNotifications(userId)).rejects.toThrow('API Error')
    })

    it('should handle empty searchParams', async () => {
      const userId = 123
      const mockResponse = {
        content: [],
        page: 1,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        unReadTotal: 0,
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockResponse)

      await apiFetchUserNotifications(userId, '')

      expect(apiClient.get).toHaveBeenCalledWith(`/notifications/users/${userId}`)
    })
  })

  describe('apiReadNotification', () => {
    it('should call apiClient.patch with correct URL and notificationId', async () => {
      const notificationId = 456
      const mockResponse = { success: true }

      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await apiReadNotification(notificationId)

      expect(apiClient.patch).toHaveBeenCalledWith(`/notifications/${notificationId}/read`)
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const notificationId = 456
      const error = new Error('API Error')

      ;(apiClient.patch as jest.Mock).mockRejectedValue(error)

      await expect(apiReadNotification(notificationId)).rejects.toThrow('API Error')
    })

    it('should handle zero notificationId', async () => {
      const notificationId = 0
      const mockResponse = { success: true }

      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockResponse)

      await apiReadNotification(notificationId)

      expect(apiClient.patch).toHaveBeenCalledWith(`/notifications/${notificationId}/read`)
    })
  })

  describe('apiReadAllNotifications', () => {
    it('should call apiClient.patch with correct URL', async () => {
      const mockResponse = { success: true }

      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await apiReadAllNotifications()

      expect(apiClient.patch).toHaveBeenCalledWith('/notifications/read-all')
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const error = new Error('API Error')

      ;(apiClient.patch as jest.Mock).mockRejectedValue(error)

      await expect(apiReadAllNotifications()).rejects.toThrow('API Error')
    })

    it('should handle successful response', async () => {
      const mockResponse = { success: true, message: 'All notifications marked as read' }

      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await apiReadAllNotifications()

      expect(result).toEqual(mockResponse)
    })
  })
})
