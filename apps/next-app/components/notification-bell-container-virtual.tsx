'use client'

import { useNotificationCursor } from '@next-app/hooks/useNotificationCursor'
import dynamic from 'next/dynamic'
import { useCallback } from 'react'

const DpNotificationBellVirtualScrollComponentDynamic = dynamic(
  () => import('@js-monorepo/notifications-ui').then((module) => module.DpNotificationBellVirtualScrollComponent),
  { ssr: false }
)

const initialLimit = 15

interface NotificationBellContainerVirtualProps {
  userId: number | undefined
}

export function NotificationBellContainerVirtual({ userId }: NotificationBellContainerVirtualProps) {
  const { accumulatedNotifications, notifications, loadMore, hasMore, isLoading, handleRead, handleReadAll } =
    useNotificationCursor({
      userId,
      initialLimit,
    })

  const handleLoadMore = useCallback(
    async (cursor: number | null) => {
      if (cursor !== null) {
        await loadMore(cursor)
      } else if (notifications?.nextCursor !== null && notifications?.nextCursor !== undefined) {
        await loadMore(notifications.nextCursor)
      }
    },
    [loadMore, notifications?.nextCursor]
  )

  if (!userId) return null

  return (
    <DpNotificationBellVirtualScrollComponentDynamic
      className="mt-[0.58rem]"
      unreadNotificationCount={notifications?.unReadTotal ?? 0}
      notificationList={accumulatedNotifications}
      onRead={handleRead}
      onReadAll={handleReadAll}
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
      isLoading={isLoading}
      resetOnClose={true}
    />
  )
}
