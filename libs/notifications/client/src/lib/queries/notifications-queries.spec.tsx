import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useReadAllNotifications,
  useReadNotification,
  useUserNotifications,
  useUserNotificationsByCursor,
} from './notifications-queries'
// @ts-expect-error - Jest resolves this path alias correctly at runtime
import { apiClient } from '@js-monorepo/utils/http'
// @ts-expect-error - Jest resolves this path alias correctly at runtime
import { handleQueryResponse, queryKeys } from '@js-monorepo/utils/http/queries'
// @ts-expect-error - Jest resolves this path alias correctly at runtime
import { UserNotificationType } from '@js-monorepo/types'

// Mock dependencies
jest.mock('@js-monorepo/utils/http', () => ({
  apiClient: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}))

jest.mock('@js-monorepo/utils/http/queries', () => ({
  handleQueryResponse: jest.fn((response) => response),
  queryKeys: {
    notifications: {
      user: jest.fn((userId, searchParams) => ['notifications', 'user', userId, searchParams]),
    },
  },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('notifications-queries', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(apiClient.get as jest.Mock).mockReset()
    ;(apiClient.patch as jest.Mock).mockReset()
  })

  describe('useUserNotifications', () => {
    it('should fetch user notifications successfully', async () => {
      const userId = 123
      const mockResponse = {
        content: [
          {
            notification: { id: 1, message: 'Test 1', createdAt: new Date() },
            isRead: false,
          },
        ],
        page: 1,
        pageSize: 10,
        totalElements: 1,
        totalPages: 1,
        unReadTotal: 1,
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useUserNotifications(userId), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(apiClient.get).toHaveBeenCalledWith(`/notifications/users/${userId}`)
    })

    it('should include searchParams in API call when provided', async () => {
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

      const { result } = renderHook(() => useUserNotifications(userId, searchParams), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(apiClient.get).toHaveBeenCalledWith(`/notifications/users/${userId}${searchParams}`)
    })

    it('should not fetch when userId is undefined', () => {
      const { result } = renderHook(() => useUserNotifications(undefined), {
        wrapper: createWrapper(),
      })

      expect(result.current.isFetching).toBe(false)
      expect(apiClient.get).not.toHaveBeenCalled()
    })

    it('should not fetch when userId is 0', () => {
      const { result } = renderHook(() => useUserNotifications(0), {
        wrapper: createWrapper(),
      })

      expect(result.current.isFetching).toBe(false)
      expect(apiClient.get).not.toHaveBeenCalled()
    })

    it('should handle API errors', async () => {
      const userId = 123
      const error = new Error('API Error')

      ;(apiClient.get as jest.Mock).mockRejectedValue(error)

      const { result } = renderHook(() => useUserNotifications(userId), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })

    it('should use correct query key', () => {
      const userId = 123
      const searchParams = '?page=1'

      renderHook(() => useUserNotifications(userId, searchParams), {
        wrapper: createWrapper(),
      })

      expect(queryKeys.notifications.user).toHaveBeenCalledWith(userId, searchParams)
    })

    it('should keep previous data while loading', async () => {
      const userId = 123
      const previousData = {
        content: [],
        page: 1,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        unReadTotal: 0,
      }
      const newData = {
        content: [
          {
            notification: { id: 1, message: 'New', createdAt: new Date() },
            isRead: false,
          },
        ],
        page: 1,
        pageSize: 10,
        totalElements: 1,
        totalPages: 1,
        unReadTotal: 1,
      }

      ;(apiClient.get as jest.Mock).mockResolvedValueOnce(previousData).mockResolvedValueOnce(newData)

      const { result, rerender } = renderHook(() => useUserNotifications(userId), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(previousData)

      rerender()

      await waitFor(() => {
        expect(result.current.data).toBeDefined()
      })
    })
  })

  describe('useReadNotification', () => {
    it('should mark notification as read successfully', async () => {
      const notificationId = 456
      const mockResponse = { success: true }

      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useReadNotification(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(notificationId)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(apiClient.patch).toHaveBeenCalledWith(`/notifications/${notificationId}/read`)
    })

    it('should update query cache on success', async () => {
      const notificationId = 456
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
        },
      })
      queryClient.setQueryData(['notifications', 'user'], {
        content: [
          {
            notification: { id: notificationId, message: 'Test', createdAt: new Date() },
            isRead: false,
          },
        ],
        unReadTotal: 1,
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      ;(apiClient.patch as jest.Mock).mockResolvedValue({ success: true })

      const { result } = renderHook(() => useReadNotification(), {
        wrapper,
      })

      result.current.mutate(notificationId)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const updatedData = queryClient.getQueryData(['notifications', 'user']) as any
      expect(updatedData.content[0].isRead).toBe(true)
      expect(updatedData.unReadTotal).toBe(0)
    })

    it('should not update unReadTotal if notification was already read', async () => {
      const notificationId = 456
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
        },
      })
      queryClient.setQueryData(['notifications', 'user'], {
        content: [
          {
            notification: { id: notificationId, message: 'Test', createdAt: new Date() },
            isRead: true,
          },
        ],
        unReadTotal: 5,
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      ;(apiClient.patch as jest.Mock).mockResolvedValue({ success: true })

      const { result } = renderHook(() => useReadNotification(), {
        wrapper,
      })

      result.current.mutate(notificationId)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const updatedData = queryClient.getQueryData(['notifications', 'user']) as any
      expect(updatedData.unReadTotal).toBe(5)
    })

    it('should handle API errors', async () => {
      const notificationId = 456
      const error = new Error('API Error')

      ;(apiClient.patch as jest.Mock).mockRejectedValue(error)

      const { result } = renderHook(() => useReadNotification(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(notificationId)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })

    it('should handle missing content in cache', async () => {
      const notificationId = 456
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
        },
      })
      queryClient.setQueryData(['notifications', 'user'], {
        unReadTotal: 1,
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      ;(apiClient.patch as jest.Mock).mockResolvedValue({ success: true })

      const { result } = renderHook(() => useReadNotification(), {
        wrapper,
      })

      result.current.mutate(notificationId)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const updatedData = queryClient.getQueryData(['notifications', 'user'])
      expect(updatedData).toBeDefined()
    })
  })

  describe('useReadAllNotifications', () => {
    it('should mark all notifications as read successfully', async () => {
      const mockResponse = { success: true }

      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useReadAllNotifications(), {
        wrapper: createWrapper(),
      })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(apiClient.patch).toHaveBeenCalledWith('/notifications/read-all')
    })

    it('should update query cache on success', async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
        },
      })
      queryClient.setQueryData(['notifications', 'user'], {
        content: [
          {
            notification: { id: 1, message: 'Test 1', createdAt: new Date() },
            isRead: false,
          },
          {
            notification: { id: 2, message: 'Test 2', createdAt: new Date() },
            isRead: false,
          },
        ],
        unReadTotal: 2,
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      ;(apiClient.patch as jest.Mock).mockResolvedValue({ success: true })

      const { result } = renderHook(() => useReadAllNotifications(), {
        wrapper,
      })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const updatedData = queryClient.getQueryData(['notifications', 'user']) as any
      expect(updatedData.content[0].isRead).toBe(true)
      expect(updatedData.content[1].isRead).toBe(true)
      expect(updatedData.unReadTotal).toBe(0)
    })

    it('should handle missing content in cache', async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
        },
      })
      queryClient.setQueryData(['notifications', 'user'], {
        unReadTotal: 5,
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      ;(apiClient.patch as jest.Mock).mockResolvedValue({ success: true })

      const { result } = renderHook(() => useReadAllNotifications(), {
        wrapper,
      })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const updatedData = queryClient.getQueryData(['notifications', 'user'])
      expect(updatedData).toBeDefined()
    })

    it('should handle API errors', async () => {
      const error = new Error('API Error')

      ;(apiClient.patch as jest.Mock).mockRejectedValue(error)

      const { result } = renderHook(() => useReadAllNotifications(), {
        wrapper: createWrapper(),
      })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })

    it('should handle empty content array', async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
        },
      })
      queryClient.setQueryData(['notifications', 'user'], {
        content: [],
        unReadTotal: 0,
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      ;(apiClient.patch as jest.Mock).mockResolvedValue({ success: true })

      const { result } = renderHook(() => useReadAllNotifications(), {
        wrapper,
      })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const updatedData = queryClient.getQueryData(['notifications', 'user']) as any
      expect(updatedData.content).toEqual([])
      expect(updatedData.unReadTotal).toBe(0)
    })
  })

  describe('useUserNotificationsByCursor', () => {
    it('should fetch user notifications with cursor successfully', async () => {
      const userId = 123
      const cursor = 100
      const limit = 15
      const mockResponse = {
        content: [
          {
            notification: { id: 1, message: 'Test 1', createdAt: new Date() },
            isRead: false,
          },
        ],
        nextCursor: 85,
        hasMore: true,
        limit: 15,
        unReadTotal: 1,
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useUserNotificationsByCursor(userId, cursor, limit), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(apiClient.get).toHaveBeenCalledWith(`/notifications/users/${userId}?cursor=100&limit=15`)
    })

    it('should fetch with null cursor', async () => {
      const userId = 123
      const cursor = null
      const limit = 15
      const mockResponse = {
        content: [],
        nextCursor: 85,
        hasMore: true,
        limit: 15,
        unReadTotal: 0,
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useUserNotificationsByCursor(userId, cursor, limit), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(apiClient.get).toHaveBeenCalledWith(`/notifications/users/${userId}?limit=15`)
    })

    it('should not fetch when userId is undefined', () => {
      const { result } = renderHook(() => useUserNotificationsByCursor(undefined, null, 15), {
        wrapper: createWrapper(),
      })

      expect(result.current.isFetching).toBe(false)
      expect(apiClient.get).not.toHaveBeenCalled()
    })

    it('should handle API errors', async () => {
      const userId = 123
      const error = new Error('API Error')

      ;(apiClient.get as jest.Mock).mockRejectedValue(error)

      const { result } = renderHook(() => useUserNotificationsByCursor(userId, null, 15), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })

    it('should use correct query key', () => {
      const userId = 123
      const cursor = 100
      const limit = 15

      renderHook(() => useUserNotificationsByCursor(userId, cursor, limit), {
        wrapper: createWrapper(),
      })

      expect(queryKeys.notifications.user).toHaveBeenCalledWith(userId, 'cursor=100&limit=15')
    })
  })
})
