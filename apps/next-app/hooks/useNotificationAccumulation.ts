'use client'

import {
  useNotificationWebSocket,
  useUserNotifications,
  useReadNotification,
  useReadAllNotifications,
} from '@js-monorepo/notifications-ui'
import { UserNotificationType } from '@js-monorepo/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@js-monorepo/utils/http/queries'
import { apiClient } from '@js-monorepo/utils/http'
import { handleQueryResponse } from '@js-monorepo/utils/http/queries'

interface UseNotificationAccumulationOptions {
  userId: number | undefined
  initialPage?: number
  initialPageSize?: number
}

interface UseNotificationAccumulationReturn {
  accumulatedNotifications: UserNotificationType[]
  notifications: ReturnType<typeof useUserNotifications>['data']
  readNotificationMutation: ReturnType<typeof useReadNotification>
  readAllNotificationsMutation: ReturnType<typeof useReadAllNotifications>
  handlePaginationChange: (pagination: { page: number; pageSize: number }) => Promise<void>
  handleRead: (id: number) => Promise<boolean>
  handleReadAll: () => Promise<boolean>
}

export function useNotificationAccumulation({
  userId,
  initialPage = 1,
  initialPageSize = 25,
}: UseNotificationAccumulationOptions): UseNotificationAccumulationReturn {
  const queryClient = useQueryClient()
  const searchQuery = `?page=${initialPage}&pageSize=${initialPageSize}`

  // All hooks must be called unconditionally (React rules)
  const { data: notifications } = useUserNotifications(userId, searchQuery)
  const readNotificationMutation = useReadNotification()
  const readAllNotificationsMutation = useReadAllNotifications()

  // Accumulate notifications across pages for virtual scroll
  const accumulatedNotificationsRef = useRef<UserNotificationType[]>([])
  const loadedPagesRef = useRef<Set<number>>(new Set())
  const [accumulatedNotifications, setAccumulatedNotifications] = useState<UserNotificationType[]>([])

  // Initialize accumulated notifications from current page
  useEffect(() => {
    // Early return if userId is not available
    if (!userId || !notifications?.content) return

    if (notifications.content) {
      const currentPage = notifications.page || 1

      // Reset if we're back to page 1 (e.g., after dropdown close with resetOnClose)
      if (currentPage === 1 && loadedPagesRef.current.size > 1) {
        accumulatedNotificationsRef.current = [...notifications.content].sort(
          (a, b) => b.notification.id - a.notification.id
        )
        loadedPagesRef.current.clear()
        loadedPagesRef.current.add(1)
        setAccumulatedNotifications([...accumulatedNotificationsRef.current])
        return
      }

      if (!loadedPagesRef.current.has(currentPage)) {
        loadedPagesRef.current.add(currentPage)
        const existingIds = new Set(accumulatedNotificationsRef.current.map((n) => n.notification.id))
        const newNotifications = notifications.content.filter((n) => !existingIds.has(n.notification.id))
        accumulatedNotificationsRef.current = [...newNotifications, ...accumulatedNotificationsRef.current].sort(
          (a, b) => b.notification.id - a.notification.id
        )
        setAccumulatedNotifications([...accumulatedNotificationsRef.current])
      } else {
        // Update existing notifications if they changed (e.g., marked as read)
        const updatedNotifications = accumulatedNotificationsRef.current.map((acc) => {
          const found = notifications.content.find((n) => n.notification.id === acc.notification.id)
          return found || acc
        })
        accumulatedNotificationsRef.current = updatedNotifications
        setAccumulatedNotifications([...accumulatedNotificationsRef.current])
      }
    }
  }, [userId, notifications?.content, notifications?.page])

  // Memoized pagination change handler to prevent scroll handler recreation
  const handlePaginationChange = useCallback(
    async (pagination: { page: number; pageSize: number }) => {
      if (!userId) return
      // Fetch new page and accumulate notifications
      const newSearchQuery = `?page=${pagination.page}&pageSize=${pagination.pageSize}`
      try {
        const newPageData = await queryClient.fetchQuery({
          queryKey: queryKeys.notifications.user(userId, newSearchQuery),
          queryFn: async () => {
            const response = await apiClient.get(`/notifications/users/${userId}${newSearchQuery}`)
            return handleQueryResponse(response)
          },
        })

        // Accumulate new page data
        if (newPageData?.content && !loadedPagesRef.current.has(pagination.page)) {
          loadedPagesRef.current.add(pagination.page)
          const existingIds = new Set(
            accumulatedNotificationsRef.current.map((n: UserNotificationType) => n.notification.id)
          )
          const newNotifications = newPageData.content.filter(
            (n: UserNotificationType) => !existingIds.has(n.notification.id)
          )
          accumulatedNotificationsRef.current = [...newNotifications, ...accumulatedNotificationsRef.current].sort(
            (a, b) => b.notification.id - a.notification.id
          )
          setAccumulatedNotifications([...accumulatedNotificationsRef.current])
        }
      } catch (error) {
        console.error('Failed to load more notifications:', error)
        throw error
      }
    },
    [userId, queryClient]
  )

  // Memoize WebSocket callback to prevent unnecessary re-subscriptions
  // Only subscribe if userId is available
  const handleWebSocketNotification = useCallback(
    (notification: UserNotificationType) => {
      if (!notification || !userId) return

      // Defensive check: Skip duplicates to handle WebSocket reconnections and network retries
      // Socket.IO provides "at least once" delivery, so duplicates can occur
      const cachedData = queryClient.getQueryData<typeof notifications>(
        queryKeys.notifications.user(userId, searchQuery)
      )
      const alreadyExistsInCache = cachedData?.content?.some((n) => n.notification.id === notification.notification.id)
      const alreadyExistsInAccumulated = accumulatedNotificationsRef.current.some(
        (n) => n.notification.id === notification.notification.id
      )

      if (alreadyExistsInCache || alreadyExistsInAccumulated) {
        return // Skip duplicate
      }

      // Update query cache - handle case where cache might be empty
      queryClient.setQueryData(queryKeys.notifications.user(userId, searchQuery), (oldData: typeof notifications) => {
        // If cache is empty, initialize it with the new notification
        if (!oldData?.content) {
          return {
            content: [notification],
            page: 1,
            pageSize: initialPageSize,
            totalPages: 1,
            totalElements: 1,
            unReadTotal: notification.isRead ? 0 : 1,
          }
        }

        // Add new notification at the beginning
        return {
          ...oldData,
          content: [notification, ...oldData.content],
          unReadTotal: notification.isRead ? oldData.unReadTotal : (oldData.unReadTotal ?? 0) + 1,
        }
      })

      // Immediately sync WebSocket updates with accumulated notifications
      accumulatedNotificationsRef.current = [notification, ...accumulatedNotificationsRef.current].sort(
        (a, b) => b.notification.id - a.notification.id
      )
      setAccumulatedNotifications([...accumulatedNotificationsRef.current])
    },
    [userId, searchQuery, queryClient, initialPageSize]
  )

  // Only subscribe to WebSocket if userId is available
  useNotificationWebSocket(userId ? handleWebSocketNotification : () => {})

  // Handlers for read operations - return early if no userId
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
    return true
  }, [userId, notifications?.unReadTotal, readAllNotificationsMutation])

  return {
    accumulatedNotifications,
    notifications,
    readNotificationMutation,
    readAllNotificationsMutation,
    handlePaginationChange,
    handleRead,
    handleReadAll,
  }
}
