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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePagination } from './hooks'
import { NotificationBellButton } from './notification-bell-trigger'
import { NotificationList } from './notification-list'

interface DpNotificationBellComponentProps {
  notificationList: UserNotificationType[]
  pagebale: Pageable & { totalPages: number }
  className?: string
  onRead?: (notificationId: number) => Promise<any>
  onPaginationChange: (pagination: Pageable) => Promise<void>
}

export function DpNotificationBellComponent({
  notificationList,
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

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  )

  const isRinging = useMemo(
    () => unreadNotificationCount > 0,
    [unreadNotificationCount]
  )

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

  const handleRead = useCallback(
    (id: number) => {
      onRead?.(id)
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      )
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
          isRinging={isRinging}
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
