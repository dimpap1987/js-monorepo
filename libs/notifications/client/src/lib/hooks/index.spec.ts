import { renderHook, act } from '@testing-library/react'
import { useNotificationWebSocket } from './index'
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
})
