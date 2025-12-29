'use client'

import { useReadNotification, useReadAllNotifications } from '../queries/notifications-queries'
import { useNotificationWebSocket } from './index'
import { CursorPaginationType, UserNotificationType } from '@js-monorepo/types'
import { useCallback, useEffect, useRef, useState, startTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@js-monorepo/utils/http/queries'
import { apiClient } from '@js-monorepo/utils/http'
import { handleQueryResponse } from '@js-monorepo/utils/http/queries'

interface UseNotificationCursorOptions {
  userId: number | undefined
  initialLimit?: number
}

interface CursorNotificationsResponse extends CursorPaginationType<UserNotificationType> {
  unReadTotal?: number
}

interface UseNotificationCursorReturn {
  notifications: UserNotificationType[]
  unReadTotal: number
  loadMore: () => void
  hasMore: boolean
  isLoading: boolean
  handleRead: (id: number) => Promise<boolean>
  handleReadAll: () => Promise<boolean>
}

const DEFAULT_LIMIT = 15

export function useNotificationCursor({
  userId,
  initialLimit = DEFAULT_LIMIT,
}: UseNotificationCursorOptions): UseNotificationCursorReturn {
  const queryClient = useQueryClient()

  const [notifications, setNotifications] = useState<UserNotificationType[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [unReadTotal, setUnReadTotal] = useState(0)

  const notificationsRef = useRef<UserNotificationType[]>([])
  const initialLoadDoneRef = useRef(false)

  const readNotificationMutation = useReadNotification()
  const readAllNotificationsMutation = useReadAllNotifications()

  // Initial load
  useEffect(() => {
    if (!userId || initialLoadDoneRef.current) return

    const fetchInitial = async () => {
      setIsLoading(true)
      try {
        const queryKey = queryKeys.notifications.user(userId, `cursor=null&limit=${initialLimit}`)
        const data = await queryClient.fetchQuery<CursorNotificationsResponse>({
          queryKey,
          queryFn: async () => {
            const params = new URLSearchParams()
            params.set('limit', initialLimit.toString())
            const response = await apiClient.get(`/notifications/users/${userId}?${params.toString()}`)
            return handleQueryResponse(response)
          },
        })

        if (data?.content) {
          const sorted = [...data.content].sort((a, b) => b.notification.id - a.notification.id)
          notificationsRef.current = sorted
          setNotifications(sorted)
          setHasMore(data.hasMore ?? false)
          setUnReadTotal(data.unReadTotal ?? 0)
          initialLoadDoneRef.current = true
        }
      } catch (error) {
        console.error('Failed to fetch initial notifications:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitial()
  }, [userId, queryClient, initialLimit])

  // Load more function - uses last notification ID as cursor
  const loadMore = useCallback(async () => {
    if (!userId || isLoading || !hasMore) return

    // Get cursor from last notification in the list
    const lastNotification = notificationsRef.current[notificationsRef.current.length - 1]
    if (!lastNotification) return

    const cursor = lastNotification.notification.id

    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('cursor', cursor.toString())
      params.set('limit', initialLimit.toString())

      const response = await apiClient.get<CursorNotificationsResponse>(
        `/notifications/users/${userId}?${params.toString()}`
      )
      const data = (await handleQueryResponse(response)) as CursorNotificationsResponse

      if (data?.content && data.content.length > 0) {
        const existingIds = new Set(notificationsRef.current.map((n) => n.notification.id))
        const newNotifications = data.content.filter((n: UserNotificationType) => !existingIds.has(n.notification.id))

        if (newNotifications.length > 0) {
          const merged = [...notificationsRef.current, ...newNotifications].sort(
            (a, b) => b.notification.id - a.notification.id
          )
          notificationsRef.current = merged
          setNotifications(merged)
        }

        setHasMore(data.hasMore ?? false)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Failed to load more notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [userId, isLoading, hasMore, initialLimit])

  // WebSocket handler
  const handleWebSocketNotification = useCallback(
    (notification: UserNotificationType) => {
      if (!notification || !userId) return

      const alreadyExists = notificationsRef.current.some((n) => n.notification.id === notification.notification.id)

      if (alreadyExists) return

      startTransition(() => {
        const updated = [notification, ...notificationsRef.current].sort(
          (a, b) => b.notification.id - a.notification.id
        )
        notificationsRef.current = updated
        setNotifications(updated)

        if (!notification.isRead) {
          setUnReadTotal((prev) => prev + 1)
        }
      })
    },
    [userId]
  )

  useNotificationWebSocket(userId ? handleWebSocketNotification : () => {})

  // Handle read single notification
  const handleRead = useCallback(
    async (id: number) => {
      if (!userId) return false

      await readNotificationMutation.mutateAsync(id)

      // Update local state
      const updated = notificationsRef.current.map((n) => (n.notification.id === id ? { ...n, isRead: true } : n))
      notificationsRef.current = updated
      setNotifications(updated)
      setUnReadTotal((prev) => Math.max(0, prev - 1))

      return true
    },
    [userId, readNotificationMutation]
  )

  // Handle read all notifications
  const handleReadAll = useCallback(async () => {
    if (!userId || unReadTotal === 0) return false

    await readAllNotificationsMutation.mutateAsync()

    // Update local state
    const updated = notificationsRef.current.map((n) => ({ ...n, isRead: true }))
    notificationsRef.current = updated
    setNotifications(updated)
    setUnReadTotal(0)

    return true
  }, [userId, unReadTotal, readAllNotificationsMutation])

  return {
    notifications,
    unReadTotal,
    loadMore,
    hasMore,
    isLoading,
    handleRead,
    handleReadAll,
  }
}
