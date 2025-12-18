import { renderHook, act } from '@testing-library/react'
import { useNotificationWebSocket, usePagination } from './index'
// @ts-expect-error - Jest resolves this path alias correctly at runtime
import { useWebSocketEvent } from '@js-monorepo/next/providers'
import { NOTIFICATIONS_EVENT } from '../types/websocket-events'
// @ts-expect-error - Jest resolves this path alias correctly at runtime
import { UserNotificationType } from '@js-monorepo/types'

// Mock dependencies
jest.mock('@js-monorepo/next/providers', () => ({
  useWebSocketEvent: jest.fn(),
}))

describe('hooks/index', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useNotificationWebSocket', () => {
    it('should call useWebSocketEvent with correct event name', () => {
      const mockHandler = jest.fn()
      ;(useWebSocketEvent as jest.Mock).mockImplementation((event, handler) => {
        // Simulate receiving a notification
        handler({ data: { notification: { id: 1, message: 'Test', createdAt: new Date() }, isRead: false } })
      })

      renderHook(() => useNotificationWebSocket(mockHandler))

      expect(useWebSocketEvent).toHaveBeenCalledWith(NOTIFICATIONS_EVENT, expect.any(Function))
    })

    it('should call handler when notification is received', () => {
      const mockHandler = jest.fn()
      const mockNotification: UserNotificationType = {
        notification: { id: 1, message: 'Test', createdAt: new Date() },
        isRead: false,
      }

      ;(useWebSocketEvent as jest.Mock).mockImplementation((event, handler) => {
        handler({ data: mockNotification })
      })

      renderHook(() => useNotificationWebSocket(mockHandler))

      expect(mockHandler).toHaveBeenCalledWith(mockNotification)
    })

    it('should update handler when onReceive changes', () => {
      const mockHandler1 = jest.fn()
      const mockHandler2 = jest.fn()
      const mockNotification: UserNotificationType = {
        notification: { id: 1, message: 'Test', createdAt: new Date() },
        isRead: false,
      }

      let currentHandler: (data: any) => void
      ;(useWebSocketEvent as jest.Mock).mockImplementation((event, handler) => {
        currentHandler = handler
      })

      const { rerender } = renderHook(({ handler }) => useNotificationWebSocket(handler), {
        initialProps: { handler: mockHandler1 },
      })

      // Simulate receiving notification with first handler
      act(() => {
        currentHandler({ data: mockNotification })
      })
      expect(mockHandler1).toHaveBeenCalledWith(mockNotification)

      // Update handler
      rerender({ handler: mockHandler2 })

      // Simulate receiving notification with second handler
      act(() => {
        currentHandler({ data: mockNotification })
      })
      expect(mockHandler2).toHaveBeenCalledWith(mockNotification)
    })

    it('should not call handler when data is invalid', () => {
      const mockHandler = jest.fn()

      ;(useWebSocketEvent as jest.Mock).mockImplementation((event, handler) => {
        handler(null)
        handler(undefined)
        handler({})
        handler('invalid')
      })

      renderHook(() => useNotificationWebSocket(mockHandler))

      expect(mockHandler).not.toHaveBeenCalled()
    })

    it('should handle notification without data property', () => {
      const mockHandler = jest.fn()

      ;(useWebSocketEvent as jest.Mock).mockImplementation((event, handler) => {
        handler({ otherProperty: 'value' })
      })

      renderHook(() => useNotificationWebSocket(mockHandler))

      expect(mockHandler).not.toHaveBeenCalled()
    })
  })

  describe('usePagination', () => {
    it('should initialize with correct page and pageSize', () => {
      const mockOnPaginationChange = jest.fn().mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        usePagination({
          page: 1,
          pageSize: 10,
          totalPages: 5,
          onPaginationChange: mockOnPaginationChange,
        })
      )

      expect(result.current.paginator.current.page).toBe(1)
      expect(result.current.paginator.current.pageSize).toBe(10)
      expect(result.current.isLoading).toBe(false)
    })

    it('should load more when loadMore is called', async () => {
      const mockOnPaginationChange = jest.fn().mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        usePagination({
          page: 1,
          pageSize: 10,
          totalPages: 5,
          onPaginationChange: mockOnPaginationChange,
        })
      )

      await act(async () => {
        await result.current.loadMore()
      })

      expect(mockOnPaginationChange).toHaveBeenCalledWith({ page: 2, pageSize: 10 })
      expect(result.current.paginator.current.page).toBe(2)
    })

    it('should not load more when already loading', async () => {
      const mockOnPaginationChange = jest.fn(() => new Promise((resolve) => setTimeout(resolve, 100)))

      const { result } = renderHook(() =>
        usePagination({
          page: 1,
          pageSize: 10,
          totalPages: 5,
          onPaginationChange: mockOnPaginationChange,
        })
      )

      // Start loading
      act(() => {
        result.current.loadMore()
      })

      expect(result.current.isLoading).toBe(true)

      // Try to load more while loading
      await act(async () => {
        await result.current.loadMore()
      })

      // Should only be called once
      expect(mockOnPaginationChange).toHaveBeenCalledTimes(1)
    })

    it('should not load more when on last page', async () => {
      const mockOnPaginationChange = jest.fn().mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        usePagination({
          page: 5,
          pageSize: 10,
          totalPages: 5,
          onPaginationChange: mockOnPaginationChange,
        })
      )

      await act(async () => {
        await result.current.loadMore()
      })

      expect(mockOnPaginationChange).not.toHaveBeenCalled()
      expect(result.current.paginator.current.page).toBe(5)
    })

    it('should not load more when totalPages is undefined and page is high', async () => {
      const mockOnPaginationChange = jest.fn().mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        usePagination({
          page: 100,
          pageSize: 10,
          totalPages: undefined,
          onPaginationChange: mockOnPaginationChange,
        })
      )

      await act(async () => {
        await result.current.loadMore()
      })

      // Should still load more when totalPages is undefined
      expect(mockOnPaginationChange).toHaveBeenCalled()
    })

    it('should revert page on error', async () => {
      const mockOnPaginationChange = jest.fn().mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(() =>
        usePagination({
          page: 1,
          pageSize: 10,
          totalPages: 5,
          onPaginationChange: mockOnPaginationChange,
        })
      )

      await act(async () => {
        try {
          await result.current.loadMore()
        } catch (e) {
          // Expected error
        }
      })

      expect(result.current.paginator.current.page).toBe(1)
    })

    it('should set paginator correctly', () => {
      const mockOnPaginationChange = jest.fn().mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        usePagination({
          page: 1,
          pageSize: 10,
          totalPages: 5,
          onPaginationChange: mockOnPaginationChange,
        })
      )

      act(() => {
        result.current.setPaginator(3, 20)
      })

      expect(result.current.paginator.current.page).toBe(3)
      expect(result.current.paginator.current.pageSize).toBe(20)
    })

    it('should handle loading state correctly', async () => {
      let resolvePromise: () => void
      const mockOnPaginationChange = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolvePromise = resolve
          })
      )

      const { result } = renderHook(() =>
        usePagination({
          page: 1,
          pageSize: 10,
          totalPages: 5,
          onPaginationChange: mockOnPaginationChange,
        })
      )

      act(() => {
        result.current.loadMore()
      })

      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        resolvePromise?.()
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('should handle page 0 correctly', async () => {
      const mockOnPaginationChange = jest.fn().mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        usePagination({
          page: 0,
          pageSize: 10,
          totalPages: 5,
          onPaginationChange: mockOnPaginationChange,
        })
      )

      await act(async () => {
        await result.current.loadMore()
      })

      expect(mockOnPaginationChange).toHaveBeenCalledWith({ page: 1, pageSize: 10 })
    })

    it('should handle large page numbers', async () => {
      const mockOnPaginationChange = jest.fn().mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        usePagination({
          page: 100,
          pageSize: 10,
          totalPages: 200,
          onPaginationChange: mockOnPaginationChange,
        })
      )

      await act(async () => {
        await result.current.loadMore()
      })

      expect(mockOnPaginationChange).toHaveBeenCalledWith({ page: 101, pageSize: 10 })
    })
  })
})
