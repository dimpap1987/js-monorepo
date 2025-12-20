'use client'

import { useNotificationAccumulation } from '@next-app/hooks/useNotificationAccumulation'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'

const DpNotificationBellComponentDynamic = dynamic(
  () => import('@js-monorepo/notifications-ui').then((module) => module.DpNotificationBellComponent),
  { ssr: false }
)

const initialPage = 1
const initialPageSize = 25

interface NotificationBellContainerProps {
  userId: number | undefined
}

/**
 * Isolated component that handles all notification logic.
 */
export function NotificationBellContainer({ userId }: NotificationBellContainerProps) {
  const { accumulatedNotifications, notifications, handlePaginationChange, handleRead, handleReadAll } =
    useNotificationAccumulation({
      userId,
      initialPage,
      initialPageSize,
    })

  const pageable = useMemo(
    () => ({
      page: notifications?.page ?? initialPage,
      pageSize: notifications?.pageSize ?? initialPageSize,
      totalPages: notifications?.totalPages ?? 0,
    }),
    [notifications?.page, notifications?.pageSize, notifications?.totalPages]
  )

  if (!userId) return null

  return (
    <DpNotificationBellComponentDynamic
      className="mt-[0.58rem]"
      pageable={pageable}
      unreadNotificationCount={notifications?.unReadTotal ?? 0}
      notificationList={accumulatedNotifications}
      onRead={handleRead}
      onReadAll={handleReadAll}
      onPaginationChange={handlePaginationChange}
      resetOnClose={true}
    />
  )
}
