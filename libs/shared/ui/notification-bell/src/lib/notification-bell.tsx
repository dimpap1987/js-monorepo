'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@js-monorepo/components/dropdown'
import { Pageable, UserNotificationType } from '@js-monorepo/types'
import { cn } from '@js-monorepo/ui/util'
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePagination } from './hooks'
import { NotificationBellButton } from './notification-bell-trigger'
import { NotificationList } from './notification-list'
import { updateNotificationAsRead } from './utils'

interface DpNotificationBellComponentProps {
  notificationList: UserNotificationType[]
  unreadNotificationCount: number
  latestReadNotificationId?: number
  pagebale: Pageable & { totalPages: number }
  className?: string
  onRead?: (notificationId: number) => Promise<any>
  onPaginationChange: (pagination: Pageable) => Promise<void>
}

export function DpNotificationBellComponent({
  notificationList,
  unreadNotificationCount,
  latestReadNotificationId,
  pagebale,
  className,
  onRead,
  onPaginationChange,
}: DpNotificationBellComponentProps) {
  const [notifications, setNotifications] = useState<UserNotificationType[]>([])

  const { isLoading, loadMore } = usePagination({
    page: pagebale.page,
    pageSize: pagebale.pageSize,
    totalPages: pagebale.totalPages,
    onPaginationChange,
  })

  const notificationContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setNotifications((prev: UserNotificationType[]) => {
      const existingIds = new Set(
        prev.map((content) => content.notification.id)
      ) // Set of existing IDs

      // Filter out already existing notifications by ID
      const newNotifications = notificationList.filter(
        (content) => !existingIds.has(content.notification.id)
      )

      const allNots = [...prev, ...newNotifications].sort(
        (a, b) => b.notification.id - a.notification.id
      )

      return allNots
    })
  }, [notificationList])

  useEffect(() => {
    if (latestReadNotificationId) {
      setNotifications((prev) =>
        updateNotificationAsRead(prev, latestReadNotificationId)
      )
    }
  }, [latestReadNotificationId])

  const handleRead = useCallback(
    (id: number) => {
      onRead?.(id)
      setNotifications((prev) => updateNotificationAsRead(prev, id))
    },
    [onRead]
  )

  const handleScroll = useCallback(() => {
    if (!notificationContainerRef?.current) return

    const { scrollTop, scrollHeight, clientHeight } =
      notificationContainerRef.current

    if (scrollTop + clientHeight >= scrollHeight - 5) {
      loadMore()
    }
  }, [loadMore])

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        setTimeout(() => {
          if (open) {
            notificationContainerRef?.current?.addEventListener(
              'scroll',
              handleScroll
            )
          } else {
            notificationContainerRef?.current?.removeEventListener(
              'scroll',
              handleScroll
            )
          }
        }, 100)
      }}
    >
      <DropdownMenuTrigger asChild>
        <NotificationBellButton
          unreadNotificationCount={unreadNotificationCount}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          'hidden sm:block p-1 bg-background-secondary mt-4 text-white w-[98svw] sm:w-[650px] xl:w-[850px]',
          className
        )}
      >
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div
          ref={notificationContainerRef}
          className="h-[calc(80vh_-_var(--navbar-height))] max-h-[502px] overflow-x-hidden overflow-y-auto"
        >
          <NotificationList
            notifications={notifications}
            onRead={handleRead}
            showLoader={isLoading}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
