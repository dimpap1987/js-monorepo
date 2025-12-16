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
  // Use notificationList directly from parent - parent now handles accumulation
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

  // Update initial notifications ref when notificationList changes (for resetOnClose)
  useEffect(() => {
    if (notificationList.length > 0) {
      initialNotificationsRef.current = [...notificationList]
    }
  }, [notificationList])

  // Sync notifications with parent's notificationList
  // Parent now handles accumulation, so we just sync here
  useEffect(() => {
    setNotifications([...notificationList].sort((a, b) => b.notification.id - a.notification.id))
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
    const oldHandler = debouncedScrollHandlerRef.current
    const container = notificationContainerRef.current

    // Remove old handler if it exists and dropdown is open
    if (oldHandler && container && isDropdownOpen) {
      container.removeEventListener('scroll', oldHandler)
      oldHandler.cancel()
    }

    // Create new handler
    debouncedScrollHandlerRef.current = debounce(() => {
      const currentContainer = notificationContainerRef.current
      if (!currentContainer) return

      const { scrollTop, scrollHeight, clientHeight } = currentContainer
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight)

      // Trigger load more when near bottom and not already loading
      if (distanceFromBottom <= SCROLL_THRESHOLD && !isLoading) {
        loadMore()
      }
    }, DEBOUNCE_DELAY)

    // Attach new handler if dropdown is open
    if (debouncedScrollHandlerRef.current && container && isDropdownOpen) {
      container.addEventListener('scroll', debouncedScrollHandlerRef.current, { passive: true })
    }

    return () => {
      debouncedScrollHandlerRef.current?.cancel()
    }
  }, [loadMore, isLoading, isDropdownOpen])

  // Handle dropdown open/close with proper event listener management
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsDropdownOpen(open)

      // Use requestAnimationFrame for better timing with DOM updates
      requestAnimationFrame(() => {
        const container = notificationContainerRef.current
        if (!container) return

        if (open) {
          requestAnimationFrame(() => {
            const currentContainer = notificationContainerRef.current
            if (currentContainer) {
              currentContainer.scrollTop = 0
            }
          })

          // Add scroll listener when dropdown opens
          if (debouncedScrollHandlerRef.current) {
            container.addEventListener('scroll', debouncedScrollHandlerRef.current, { passive: true })
          }
        } else {
          // Remove scroll listener when dropdown closes
          if (debouncedScrollHandlerRef.current) {
            container.removeEventListener('scroll', debouncedScrollHandlerRef.current)
          }

          // Reset pagination if needed
          if (resetOnClose) {
            setPaginator(1, pageable.pageSize)
            // Reset to initial notifications (parent will handle re-fetching if needed)
            setNotifications([...initialNotificationsRef.current].sort((a, b) => b.notification.id - a.notification.id))
          }
        }
      })
    },
    [resetOnClose, setPaginator, pageable.pageSize]
  )

  // Cleanup event listeners on unmount
  useEffect(() => {
    // Capture refs at mount time for cleanup (refs are stable, so this is safe)
    const containerRef = notificationContainerRef
    const handlerRef = debouncedScrollHandlerRef

    return () => {
      const container = containerRef.current
      const scrollHandler = handlerRef.current
      if (container && scrollHandler) {
        container.removeEventListener('scroll', scrollHandler)
      }
      // Cancel the debounced function to prevent stale calls
      scrollHandler?.cancel()
    }
  }, [])

  // Memoize scroll area height calculation
  const scrollAreaHeight = useMemo(
    () => (pageable?.totalPages > 1 ? 'h-[32rem] max-h-[32rem]' : 'max-h-[32rem]'),
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
            'border border-border-glass shadow-2xl backdrop-blur-sm',
            'rounded-lg overflow-hidden',
            className
          )}
          aria-label="Notifications dropdown"
        >
          <div className="sticky top-0 z-10 bg-background-secondary/95 backdrop-blur-sm border-b border-border-glass px-4 py-3">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-foreground tracking-tight">Notifications</h3>
              {unreadNotificationCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-foreground-neutral font-medium">
                    {unreadNotificationCount} {unreadNotificationCount === 1 ? 'unread' : 'unreads'}
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
