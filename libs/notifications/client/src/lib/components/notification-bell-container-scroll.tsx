'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@js-monorepo/components/dropdown'
import { ScrollArea } from '@js-monorepo/components/scroll'
import { UserNotificationType } from '@js-monorepo/types'
import { cn } from '@js-monorepo/ui/util'
import { debounce } from 'lodash'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNotificationCursor } from '../hooks/use-notification-cursor'
import { NotificationBellButton } from './bell/notification-bell-trigger'
import { NotificationReadAllButton } from './bell/notification-read-all'
import { NotificationList } from './bell/notification-list'
import { updateNotificationAsRead } from '../utils/notifications'
import { DpLoadingSpinner } from '@js-monorepo/loader'
import { NotificationEmptyState } from './notification-empty-state'

interface NotificationBellContainerScrollProps {
  userId: number | undefined
  initialLimit?: number
  className?: string
  resetOnClose?: boolean
}

const SCROLL_THRESHOLD = 10 // pixels from bottom to trigger load more
const DEBOUNCE_DELAY = 150 // milliseconds

export function NotificationBellContainerScroll({
  userId,
  initialLimit = 15,
  className,
  resetOnClose = true,
}: NotificationBellContainerScrollProps) {
  const { accumulatedNotifications, notifications, loadMore, hasMore, isLoading, handleRead, handleReadAll } =
    useNotificationCursor({
      userId,
      initialLimit,
    })

  const [localNotifications, setLocalNotifications] = useState<UserNotificationType[]>(() =>
    [...accumulatedNotifications].sort((a, b) => b.notification.id - a.notification.id)
  )
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const notificationContainerRef = useRef<HTMLDivElement>(null)
  const debouncedScrollHandlerRef = useRef<ReturnType<typeof debounce> | null>(null)
  const initialNotificationsRef = useRef<UserNotificationType[]>(accumulatedNotifications)

  // Update initial notifications ref when accumulatedNotifications changes (for resetOnClose)
  useEffect(() => {
    if (accumulatedNotifications.length > 0) {
      initialNotificationsRef.current = [...accumulatedNotifications]
    }
  }, [accumulatedNotifications])

  // Sync local notifications with accumulatedNotifications
  useEffect(() => {
    setLocalNotifications([...accumulatedNotifications].sort((a, b) => b.notification.id - a.notification.id))
  }, [accumulatedNotifications])

  // Mark all as read when unread count reaches zero
  useEffect(() => {
    if (notifications?.unReadTotal === 0) {
      setLocalNotifications((prev) => prev.map((content) => ({ ...content, isRead: true })))
    }
  }, [notifications?.unReadTotal])

  // Handle individual notification read
  const handleReadLocal = useCallback(
    async (id: number) => {
      try {
        await handleRead(id)
        setLocalNotifications((prev) => updateNotificationAsRead(prev, id))
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    },
    [handleRead]
  )

  // Handle read all notifications
  const handleReadAllLocal = useCallback(async () => {
    try {
      await handleReadAll()
      setLocalNotifications((prev) => prev.map((content) => ({ ...content, isRead: true })))
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }, [handleReadAll])

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
      if (distanceFromBottom <= SCROLL_THRESHOLD && !isLoading && hasMore) {
        const lastNotification = accumulatedNotifications[accumulatedNotifications.length - 1]
        if (lastNotification) {
          loadMore(lastNotification.notification.id)
        }
      }
    }, DEBOUNCE_DELAY)

    // Attach new handler if dropdown is open
    if (debouncedScrollHandlerRef.current && container && isDropdownOpen) {
      container.addEventListener('scroll', debouncedScrollHandlerRef.current, { passive: true })
    }

    return () => {
      debouncedScrollHandlerRef.current?.cancel()
    }
  }, [loadMore, isLoading, hasMore, isDropdownOpen, accumulatedNotifications])

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

          // Reset to initial notifications if needed
          if (resetOnClose) {
            setLocalNotifications(
              [...initialNotificationsRef.current].sort((a, b) => b.notification.id - a.notification.id)
            )
          }
        }
      })
    },
    [resetOnClose]
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
  const scrollAreaHeight = useMemo(() => 'h-[37.5rem] max-h-[37.5rem]', [])

  if (!userId) return null

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
          <NotificationBellButton unreadNotificationCount={notifications?.unReadTotal ?? 0} />
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
          <div className="sticky top-0 z-10 bg-background-secondary/95 backdrop-blur-sm border-b border-border-glass px-4 py-3.5">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-foreground tracking-tight">Notifications</h3>
              {(notifications?.unReadTotal ?? 0) > 0 && (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    {notifications?.unReadTotal} {(notifications?.unReadTotal ?? 0) === 1 ? 'unread' : 'unreads'}
                  </span>
                  <NotificationReadAllButton onReadAll={handleReadAllLocal} />
                </div>
              )}
            </div>
          </div>
          <ScrollArea className={cn('rounded-md', scrollAreaHeight)} viewPortRef={notificationContainerRef}>
            <div className="py-1">
              {localNotifications.length === 0 ? (
                <NotificationEmptyState title="No notifications yet" message="You're all caught up!" />
              ) : (
                <>
                  <NotificationList notifications={localNotifications} onRead={handleReadLocal} showLoader={false} />
                  {isLoading && hasMore && (
                    <div className="flex items-center justify-center py-4">
                      <DpLoadingSpinner message="Loading more..." className="text-sm text-foreground-neutral" />
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
