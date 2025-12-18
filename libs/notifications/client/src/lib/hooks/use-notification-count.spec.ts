import { renderHook } from '@testing-library/react'
import { useNotificationCount } from './use-notification-count'
// @ts-expect-error - Jest resolves this path alias correctly at runtime
import { useSession } from '@js-monorepo/auth/next/client'
import { useUserNotifications } from '../queries/notifications-queries'

// Mock dependencies
jest.mock('@js-monorepo/auth/next/client', () => ({
  useSession: jest.fn(),
}))

jest.mock('../queries/notifications-queries', () => ({
  useUserNotifications: jest.fn(),
}))

describe('useNotificationCount', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 0 when user is not logged in', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      session: null,
    })
    ;(useUserNotifications as jest.Mock).mockReturnValue({
      data: undefined,
    })

    const { result } = renderHook(() => useNotificationCount())

    expect(result.current).toBe(0)
  })

  it('should return 0 when session exists but user is undefined', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      session: {},
    })
    ;(useUserNotifications as jest.Mock).mockReturnValue({
      data: undefined,
    })

    const { result } = renderHook(() => useNotificationCount())

    expect(result.current).toBe(0)
  })

  it('should return 0 when user exists but data is undefined', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      session: {
        user: {
          id: 123,
        },
      },
    })
    ;(useUserNotifications as jest.Mock).mockReturnValue({
      data: undefined,
    })

    const { result } = renderHook(() => useNotificationCount())

    expect(result.current).toBe(0)
  })

  it('should return 0 when unReadTotal is undefined', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      session: {
        user: {
          id: 123,
        },
      },
    })
    ;(useUserNotifications as jest.Mock).mockReturnValue({
      data: {
        content: [],
        page: 1,
        pageSize: 1,
        totalElements: 0,
        totalPages: 0,
      },
    })

    const { result } = renderHook(() => useNotificationCount())

    expect(result.current).toBe(0)
  })

  it('should return unReadTotal when data exists', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      session: {
        user: {
          id: 123,
        },
      },
    })
    ;(useUserNotifications as jest.Mock).mockReturnValue({
      data: {
        content: [],
        page: 1,
        pageSize: 1,
        totalElements: 0,
        totalPages: 0,
        unReadTotal: 5,
      },
    })

    const { result } = renderHook(() => useNotificationCount())

    expect(result.current).toBe(5)
  })

  it('should call useUserNotifications with correct parameters', () => {
    const userId = 456
    ;(useSession as jest.Mock).mockReturnValue({
      session: {
        user: {
          id: userId,
        },
      },
    })
    ;(useUserNotifications as jest.Mock).mockReturnValue({
      data: {
        unReadTotal: 3,
      },
    })

    renderHook(() => useNotificationCount())

    expect(useUserNotifications).toHaveBeenCalledWith(userId, '?page=1&pageSize=1')
  })

  it('should return 0 when unReadTotal is 0', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      session: {
        user: {
          id: 123,
        },
      },
    })
    ;(useUserNotifications as jest.Mock).mockReturnValue({
      data: {
        content: [],
        page: 1,
        pageSize: 1,
        totalElements: 0,
        totalPages: 0,
        unReadTotal: 0,
      },
    })

    const { result } = renderHook(() => useNotificationCount())

    expect(result.current).toBe(0)
  })

  it('should handle large unReadTotal values', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      session: {
        user: {
          id: 123,
        },
      },
    })
    ;(useUserNotifications as jest.Mock).mockReturnValue({
      data: {
        content: [],
        page: 1,
        pageSize: 1,
        totalElements: 0,
        totalPages: 0,
        unReadTotal: 999,
      },
    })

    const { result } = renderHook(() => useNotificationCount())

    expect(result.current).toBe(999)
  })
})
