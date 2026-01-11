'use client'

import { UserNotificationType } from '@js-monorepo/types/notifications'
import { apiClient } from '@js-monorepo/utils/http'
import { handleQueryResponse } from '@js-monorepo/utils/http/queries'
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useNotificationWebSocket } from '../hooks'
import { useReadAllNotifications, useReadNotification } from '../queries/notifications-queries'

interface NotificationContextValue {
  notifications: UserNotificationType[]
  unreadCount: number
  isLoading: boolean
  hasMore: boolean
  loadMore: () => Promise<void>
  handleRead: (id: number) => Promise<boolean>
  handleReadAll: () => Promise<boolean>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children, userId }: { children: ReactNode; userId?: number }) {
  const [notifications, setNotifications] = useState<UserNotificationType[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const notificationsRef = useRef<UserNotificationType[]>([])
  const readMutation = useReadNotification()
  const readAllMutation = useReadAllNotifications()

  useEffect(() => {
    if (!userId) return

    const fetchInitial = async () => {
      setIsLoading(true)
      try {
        const response = await apiClient.get(`/notifications/users/${userId}?limit=15`)
        const data = await handleQueryResponse(response)
        if (data?.content) {
          const sorted = [...data.content].sort((a, b) => b.notification.id - a.notification.id)
          notificationsRef.current = sorted
          setNotifications(sorted)
          setHasMore(data.hasMore ?? false)
          setUnreadCount(data.unReadTotal ?? 0)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchInitial()
  }, [userId])

  const handleWebSocket = useCallback((notification: UserNotificationType) => {
    setNotifications((prev) => {
      if (prev.some((n) => n.notification.id === notification.notification.id)) return prev
      const updated = [notification, ...prev].sort((a, b) => b.notification.id - a.notification.id)
      notificationsRef.current = updated
      return updated
    })
    if (!notification.isRead) setUnreadCount((prev) => prev + 1)
  }, [])

  useNotificationWebSocket(userId ? handleWebSocket : () => {})

  const loadMore = useCallback(async () => {
    if (!userId || isLoading || !hasMore) return
    const lastId = notificationsRef.current[notificationsRef.current.length - 1]?.notification.id
    if (!lastId) return

    setIsLoading(true)
    try {
      const response = await apiClient.get(`/notifications/users/${userId}?cursor=${lastId}&limit=15`)
      const data = await handleQueryResponse(response)
      if (data?.content) {
        setNotifications((prev) => {
          const merged = [...prev, ...data.content].sort((a, b) => b.notification.id - a.notification.id)
          notificationsRef.current = merged
          return merged
        })
        setHasMore(data.hasMore)
      }
    } finally {
      setIsLoading(false)
    }
  }, [userId, isLoading, hasMore])

  const handleRead = useCallback(
    async (id: number) => {
      await readMutation.mutateAsync(id)
      setNotifications((prev) => prev.map((n) => (n.notification.id === id ? { ...n, isRead: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
      return true
    },
    [readMutation]
  )

  const handleReadAll = useCallback(async () => {
    await readAllMutation.mutateAsync()
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)
    return true
  }, [readAllMutation])

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, isLoading, hasMore, loadMore, handleRead, handleReadAll }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
}
