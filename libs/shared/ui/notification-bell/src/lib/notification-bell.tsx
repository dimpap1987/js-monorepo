'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@js-monorepo/components/dropdown'
import { ScrollArea } from '@js-monorepo/components/scroll'
import { Pageable, UserNotificationType } from '@js-monorepo/types'
import { cn } from '@js-monorepo/ui/util'
import { debounce } from 'lodash'
import { useCallback, useEffect, useRef, useState } from 'react'
import { NotificationBellButton } from './components/notification-bell-trigger'
import { NotificationList } from './components/notification-list'
import { NotificationReadAllButton } from './components/notification-read-all'
import { usePagination } from './hooks'
import { updateNotificationAsRead } from './utils'

interface DpNotificationBellComponentProps {
  notificationList: UserNotificationType[]
  unreadNotificationCount: number
  latestReadNotificationId?: number
  pagebale: Pageable & { totalPages: number }
  className?: string
  onRead?: (notificationId: number) => Promise<any>
  onReadAll?: () => Promise<boolean>
  onPaginationChange: (pagination: Pageable) => Promise<void>
  resetOnClose: boolean
}

export function DpNotificationBellComponent({
  notificationList,
  unreadNotificationCount,
  latestReadNotificationId,
  pagebale,
  className,
  onRead,
  onReadAll,
  onPaginationChange,
  resetOnClose = false,
}: DpNotificationBellComponentProps) {
  const [notifications, setNotifications] = useState<UserNotificationType[]>([])

  const { isLoading, loadMore, setPaginator } = usePagination({
    page: pagebale.page,
    pageSize: pagebale.pageSize,
    totalPages: pagebale.totalPages,
    onPaginationChange,
  })

  const notificationContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setNotifications((prev) => {
      const existingIds = new Set(
        prev.map((content) => content.notification.id)
      )

      const newNotifications = notificationList.filter(
        (content) => !existingIds.has(content.notification.id)
      )

      // Only update if there are new notifications
      if (newNotifications.length === 0) return prev

      return [...prev, ...newNotifications].sort(
        (a, b) => b.notification.id - a.notification.id
      )
    })
  }, [notificationList])

  useEffect(() => {
    if (latestReadNotificationId) {
      setNotifications((prev) =>
        updateNotificationAsRead(prev, latestReadNotificationId)
      )
    }
  }, [latestReadNotificationId])

  useEffect(() => {
    if (unreadNotificationCount === 0) {
      setNotifications((prev) =>
        prev?.map((content) => ({ ...content, isRead: true }))
      )
    }
  }, [unreadNotificationCount])

  const handleRead = useCallback(
    (id: number) => {
      onRead?.(id)
      setNotifications((prev) => updateNotificationAsRead(prev, id))
    },
    [onRead]
  )

  const handleScroll = useCallback(
    debounce(() => {
      if (!notificationContainerRef?.current) return

      const { scrollTop, scrollHeight, clientHeight } =
        notificationContainerRef.current

      if (scrollTop + clientHeight >= scrollHeight - 5) {
        loadMore()
      }
    }, 200),
    [loadMore]
  )

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
            if (resetOnClose) {
              setPaginator(1, pagebale.pageSize)
              setNotifications(notifications.slice(0, 10))
            }
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
        <DropdownMenuLabel className="flex justify-between">
          <div className="content-center">Notifications</div>
          <NotificationReadAllButton
            onReadAll={async () => {
              const isReadAll = await onReadAll?.()
              if (!isReadAll) return

              setNotifications((prev) =>
                prev.map((content) => ({ ...content, isRead: true }))
              )
            }}
          ></NotificationReadAllButton>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea
          className={`${pagebale?.totalPages > 1 ? 'h-[27.2rem]' : ''} rounded-md`}
          viewPortRef={notificationContainerRef}
        >
          <NotificationList
            notifications={notifications}
            onRead={handleRead}
            showLoader={isLoading}
          />
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
