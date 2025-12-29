'use client'

import {
  useNotificationWebSocket,
  useUserNotificationsByCursor,
  useReadNotification,
  useReadAllNotifications,
} from '@js-monorepo/notifications-ui'
import { UserNotificationType } from '@js-monorepo/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@js-monorepo/utils/http/queries'
import { apiClient } from '@js-monorepo/utils/http'
import { handleQueryResponse } from '@js-monorepo/utils/http/queries'

interface UseNotificationCursorOptions {
  userId: number | undefined
  initialLimit?: number
}

interface UseNotificationCursorReturn {
  accumulatedNotifications: UserNotificationType[]
  notifications: ReturnType<typeof useUserNotificationsByCursor>['data']
  readNotificationMutation: ReturnType<typeof useReadNotification>
  readAllNotificationsMutation: ReturnType<typeof useReadAllNotifications>
  loadMore: (cursor: number | null) => Promise<void>
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
  const [cursor, setCursor] = useState<number | null>(null)
  const [accumulatedNotifications, setAccumulatedNotifications] = useState<UserNotificationType[]>([])
  const loadedCursorsRef = useRef<Set<number | null>>(new Set())

  const { data: notifications, isLoading } = useUserNotificationsByCursor(userId, cursor, initialLimit)
  const readNotificationMutation = useReadNotification()
  const readAllNotificationsMutation = useReadAllNotifications()

  const accumulatedNotificationsRef = useRef<UserNotificationType[]>([])

  useEffect(() => {
    if (!userId || !notifications?.content) return

    const currentCursor = cursor

    if (currentCursor === null && loadedCursorsRef.current.size > 1) {
      const sorted = [...notifications.content].sort((a, b) => b.notification.id - a.notification.id)
      accumulatedNotificationsRef.current = sorted
      loadedCursorsRef.current.clear()
      loadedCursorsRef.current.add(null)
      setAccumulatedNotifications([...accumulatedNotificationsRef.current])
      return
    }

    if (!loadedCursorsRef.current.has(currentCursor)) {
      loadedCursorsRef.current.add(currentCursor)
      const existingIds = new Set(accumulatedNotificationsRef.current.map((n) => n.notification.id))
      const newNotifications = notifications.content.filter((n) => !existingIds.has(n.notification.id))
      accumulatedNotificationsRef.current = [...accumulatedNotificationsRef.current, ...newNotifications].sort(
        (a, b) => b.notification.id - a.notification.id
      )
      setAccumulatedNotifications([...accumulatedNotificationsRef.current])
    } else {
      const updatedNotifications = accumulatedNotificationsRef.current.map((acc) => {
        const found = notifications.content.find((n) => n.notification.id === acc.notification.id)
        return found || acc
      })
      accumulatedNotificationsRef.current = updatedNotifications
      setAccumulatedNotifications([...updatedNotifications])
    }
  }, [userId, notifications?.content, cursor])

  useEffect(() => {
    accumulatedNotificationsRef.current = accumulatedNotifications
  }, [accumulatedNotifications])

  const loadMore = useCallback(
    async (nextCursor: number | null) => {
      if (!userId || isLoading || loadedCursorsRef.current.has(nextCursor)) return

      try {
        const queryKey = queryKeys.notifications.user(userId, `cursor=${nextCursor}&limit=${initialLimit}`)
        const newPageData = await queryClient.fetchQuery({
          queryKey,
          queryFn: async () => {
            const params = new URLSearchParams()
            if (nextCursor !== null) {
              params.set('cursor', nextCursor.toString())
            }
            params.set('limit', initialLimit.toString())
            const queryString = params.toString()
            const response = await apiClient.get(`/notifications/users/${userId}?${queryString}`)
            return handleQueryResponse(response)
          },
        })

        if (newPageData?.content) {
          loadedCursorsRef.current.add(nextCursor)
          const existingIds = new Set(
            accumulatedNotificationsRef.current.map((n: UserNotificationType) => n.notification.id)
          )
          const newNotifications = newPageData.content.filter(
            (n: UserNotificationType) => !existingIds.has(n.notification.id)
          )
          accumulatedNotificationsRef.current = [...accumulatedNotificationsRef.current, ...newNotifications].sort(
            (a, b) => b.notification.id - a.notification.id
          )
          setAccumulatedNotifications([...accumulatedNotificationsRef.current])
          setCursor(nextCursor)
        }
      } catch (error) {
        console.error('Failed to load more notifications:', error)
        throw error
      }
    },
    [userId, queryClient, initialLimit, isLoading]
  )

  const handleWebSocketNotification = useCallback(
    (notification: UserNotificationType) => {
      if (!notification || !userId) return

      const alreadyExists = accumulatedNotificationsRef.current.some(
        (n) => n.notification.id === notification.notification.id
      )

      if (alreadyExists) {
        return
      }

      queryClient.setQueriesData(
        { queryKey: ['notifications', 'user', userId] },
        (oldData: typeof notifications | undefined) => {
          if (!oldData) {
            return {
              content: [notification],
              nextCursor: null,
              hasMore: false,
              limit: initialLimit,
              unReadTotal: notification.isRead ? 0 : 1,
            }
          }

          const existsInContent = oldData.content?.some(
            (n: UserNotificationType) => n.notification.id === notification.notification.id
          )

          if (existsInContent) {
            return oldData
          }

          return {
            ...oldData,
            content: [notification, ...(oldData.content || [])],
            unReadTotal: notification.isRead ? oldData.unReadTotal : (oldData.unReadTotal ?? 0) + 1,
          }
        }
      )

      accumulatedNotificationsRef.current = [notification, ...accumulatedNotificationsRef.current].sort(
        (a, b) => b.notification.id - a.notification.id
      )
      setAccumulatedNotifications([...accumulatedNotificationsRef.current])
    },
    [userId, queryClient, initialLimit]
  )

  useNotificationWebSocket(userId ? handleWebSocketNotification : () => {})

  const handleRead = useCallback(
    async (id: number) => {
      if (!userId) return false
      await readNotificationMutation.mutateAsync(id)
      return true
    },
    [userId, readNotificationMutation]
  )

  const handleReadAll = useCallback(async () => {
    if (!userId || (notifications?.unReadTotal ?? 0) === 0) return false
    await readAllNotificationsMutation.mutateAsync()
    accumulatedNotificationsRef.current = accumulatedNotificationsRef.current.map((content) => ({
      ...content,
      isRead: true,
    }))
    setAccumulatedNotifications([...accumulatedNotificationsRef.current])
    return true
  }, [userId, notifications?.unReadTotal, readAllNotificationsMutation])

  return {
    accumulatedNotifications,
    notifications,
    readNotificationMutation,
    readAllNotificationsMutation,
    loadMore,
    hasMore: notifications?.hasMore ?? false,
    isLoading,
    handleRead,
    handleReadAll,
  }
}
