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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePagination } from '../hooks'
import { NotificationBellButton } from './bell/notification-bell-trigger'
import { NotificationReadAllButton } from './bell/notification-read-all'
import { NotificationList } from './bell/notification-list'
import { updateNotificationAsRead } from '../utils/notifications'

interface DpNotificationBellComponentProps {
  notificationList: UserNotificationType[]
  unreadNotificationCount: number
  latestReadNotificationId?: number
  pageable: Pageable & { totalPages: number }
  className?: string
  onRead?: (notificationId: number) => Promise<any>
  onReadAll?: () => Promise<boolean>
  onPaginationChange: (pagination: Pageable) => Promise<void>
  resetOnClose?: boolean
}

const SCROLL_THRESHOLD = 10 // pixels from bottom to trigger load more
const DEBOUNCE_DELAY = 150 // milliseconds

export function DpNotificationBellComponent({
  notificationList,
  unreadNotificationCount,
  latestReadNotificationId,
  pageable,
  className,
  onRead,
  onReadAll,
  onPaginationChange,
  resetOnClose = false,
}: DpNotificationBellComponentProps) {
  // Initialize notifications from prop
  const [notifications, setNotifications] = useState<UserNotificationType[]>(() =>
    [...notificationList].sort((a, b) => b.notification.id - a.notification.id)
  )
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const notificationContainerRef = useRef<HTMLDivElement>(null)
  const debouncedScrollHandlerRef = useRef<ReturnType<typeof debounce> | null>(null)
  const initialNotificationsRef = useRef<UserNotificationType[]>(notificationList)

  const { isLoading, loadMore, setPaginator } = usePagination({
    page: pageable.page,
    pageSize: pageable.pageSize,
    totalPages: pageable.totalPages,
    onPaginationChange,
  })

  // Update initial notifications ref when notificationList changes (first load)
  useEffect(() => {
    if (notificationList.length > 0 && notifications.length === 0) {
      initialNotificationsRef.current = notificationList
    }
  }, [notificationList, notifications.length])

  // Merge new notifications from prop, avoiding duplicates
  useEffect(() => {
    setNotifications((prev) => {
      const existingIds = new Set(prev.map((content) => content.notification.id))
      const newNotifications = notificationList.filter((content) => !existingIds.has(content.notification.id))

      if (newNotifications.length === 0) return prev

      return [...prev, ...newNotifications].sort((a, b) => b.notification.id - a.notification.id)
    })
  }, [notificationList])

  // Update notification read status when latestReadNotificationId changes
  useEffect(() => {
    if (latestReadNotificationId) {
      setNotifications((prev) => updateNotificationAsRead(prev, latestReadNotificationId))
    }
  }, [latestReadNotificationId])

  // Mark all as read when unread count reaches zero
  useEffect(() => {
    if (unreadNotificationCount === 0) {
      setNotifications((prev) => prev.map((content) => ({ ...content, isRead: true })))
    }
  }, [unreadNotificationCount])

  // Handle individual notification read
  const handleRead = useCallback(
    async (id: number) => {
      try {
        await onRead?.(id)
        setNotifications((prev) => updateNotificationAsRead(prev, id))
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    },
    [onRead]
  )

  // Handle read all notifications
  const handleReadAll = useCallback(async () => {
    try {
      const success = await onReadAll?.()
      if (success) {
        setNotifications((prev) => prev.map((content) => ({ ...content, isRead: true })))
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }, [onReadAll])

  // Create debounced scroll handler with proper cleanup
  useEffect(() => {
    debouncedScrollHandlerRef.current = debounce(() => {
      const container = notificationContainerRef.current
      if (!container) return

      const { scrollTop, scrollHeight, clientHeight } = container
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight)

      // Trigger load more when near bottom and not already loading
      if (distanceFromBottom <= SCROLL_THRESHOLD && !isLoading) {
        loadMore()
      }
    }, DEBOUNCE_DELAY)

    return () => {
      debouncedScrollHandlerRef.current?.cancel()
    }
  }, [loadMore, isLoading])

  // Handle dropdown open/close with proper event listener management
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsDropdownOpen(open)

      // Use requestAnimationFrame for better timing with DOM updates
      requestAnimationFrame(() => {
        const container = notificationContainerRef.current
        if (!container) return

        if (open) {
          // Add scroll listener when dropdown opens
          if (debouncedScrollHandlerRef.current) {
            container.addEventListener('scroll', debouncedScrollHandlerRef.current, { passive: true })
          }
        } else {
          // Remove scroll listener when dropdown closes
          if (debouncedScrollHandlerRef.current) {
            container.removeEventListener('scroll', debouncedScrollHandlerRef.current)
          }

          // Reset state if needed
          if (resetOnClose) {
            setPaginator(1, pageable.pageSize)
            setNotifications([...initialNotificationsRef.current].sort((a, b) => b.notification.id - a.notification.id))
          }
        }
      })
    },
    [resetOnClose, setPaginator, pageable.pageSize]
  )

  // Cleanup event listeners on unmount
  useEffect(() => {
    const container = notificationContainerRef.current
    const scrollHandler = debouncedScrollHandlerRef.current

    return () => {
      if (container && scrollHandler) {
        container.removeEventListener('scroll', scrollHandler)
      }
      scrollHandler?.cancel()
    }
  }, [])

  // Memoize scroll area height calculation
  const scrollAreaHeight = useMemo(
    () => (pageable?.totalPages > 1 ? 'h-[28rem] max-h-[28rem]' : 'max-h-[28rem]'),
    [pageable?.totalPages]
  )

  return (
    <>
      {/* Backdrop overlay when dropdown is open */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 top-navbar-offset bg-background/40 backdrop-blur-sm z-10 transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      <DropdownMenu onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <NotificationBellButton unreadNotificationCount={unreadNotificationCount} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={cn(
            'hidden z-30 sm:block p-0 bg-background-secondary text-foreground w-[98svw] sm:w-[650px] xl:w-[850px]',
            'border border-border/50 shadow-2xl backdrop-blur-sm',
            'rounded-lg overflow-hidden',
            className
          )}
          aria-label="Notifications dropdown"
        >
          <div className="sticky top-0 z-10 bg-background-secondary/95 backdrop-blur-sm border-b border-border/30 px-4 py-3">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-foreground tracking-tight">Notifications</h3>
              {unreadNotificationCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-foreground-neutral font-medium">
                    {unreadNotificationCount} {unreadNotificationCount === 1 ? 'unread' : 'unread'}
                  </span>
                  <NotificationReadAllButton onReadAll={handleReadAll} />
                </div>
              )}
            </div>
          </div>
          <ScrollArea className={cn('rounded-md', scrollAreaHeight)} viewPortRef={notificationContainerRef}>
            <div className="py-1">
              <NotificationList notifications={notifications} onRead={handleRead} showLoader={isLoading} />
            </div>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
