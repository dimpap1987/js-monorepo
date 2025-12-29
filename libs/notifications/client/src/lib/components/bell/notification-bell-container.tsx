'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@js-monorepo/components/dropdown'
import { ScrollArea } from '@js-monorepo/components/scroll'
import { DpLoadingSpinner } from '@js-monorepo/loader'
import { UserNotificationType } from '@js-monorepo/types'
import { cn } from '@js-monorepo/ui/util'
import { debounce } from 'lodash'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNotificationCursor } from '../../hooks/use-notification-cursor'
import { updateNotificationAsRead } from '../../utils/notifications'
import { NotificationEmptyState } from '../notification-empty-state'
import { NotificationBellButton } from './notification-bell-trigger'
import { NotificationList } from './notification-list'
import { NotificationReadAllButton } from './notification-read-all'

interface NotificationBellContainerScrollProps {
  userId: number | undefined
  initialLimit?: number
  className?: string
  resetOnClose?: boolean
}

const SCROLL_THRESHOLD = 10 // pixels from bottom to trigger load more
const DEBOUNCE_DELAY = 150 // milliseconds
const LOAD_MORE_DELAY = 500 // delay before subsequent load more requests

export function NotificationBellContainerScroll({
  userId,
  initialLimit = 15,
  className,
  resetOnClose = true,
}: NotificationBellContainerScrollProps) {
  const { notifications, unReadTotal, loadMore, hasMore, isLoading, handleRead, handleReadAll } = useNotificationCursor(
    {
      userId,
      initialLimit,
    }
  )

  const [localNotifications, setLocalNotifications] = useState<UserNotificationType[]>(() =>
    [...notifications].sort((a, b) => b.notification.id - a.notification.id)
  )
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const notificationContainerRef = useRef<HTMLDivElement>(null)
  const debouncedScrollHandlerRef = useRef<ReturnType<typeof debounce> | null>(null)
  const initialNotificationsRef = useRef<UserNotificationType[]>(notifications)
  const isFirstLoadMoreRef = useRef(true)
  const isLoadingMoreRef = useRef(false)
  const loadMoreTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update initial notifications ref when notifications changes (for resetOnClose)
  useEffect(() => {
    if (notifications.length > 0) {
      initialNotificationsRef.current = [...notifications]
    }
  }, [notifications])

  // Sync local notifications with notifications
  useEffect(() => {
    setLocalNotifications([...notifications].sort((a, b) => b.notification.id - a.notification.id))
  }, [notifications])

  // Mark all as read when unread count reaches zero
  useEffect(() => {
    if (unReadTotal === 0) {
      setLocalNotifications((prev) => prev.map((content) => ({ ...content, isRead: true })))
    }
  }, [unReadTotal])

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

  // Reset loading state when isLoading changes to false
  useEffect(() => {
    if (!isLoading) {
      isLoadingMoreRef.current = false
      setIsLoadingMore(false)
    }
  }, [isLoading])

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
      if (distanceFromBottom <= SCROLL_THRESHOLD && !isLoading && hasMore && !isLoadingMoreRef.current) {
        isLoadingMoreRef.current = true

        if (isFirstLoadMoreRef.current) {
          // First load more - no delay
          isFirstLoadMoreRef.current = false
          loadMore()
        } else {
          // Subsequent loads - add delay
          setIsLoadingMore(true)
          loadMoreTimeoutRef.current = setTimeout(() => {
            loadMore()
          }, LOAD_MORE_DELAY)
        }
      }
    }, DEBOUNCE_DELAY)

    // Attach new handler if dropdown is open
    if (debouncedScrollHandlerRef.current && container && isDropdownOpen) {
      container.addEventListener('scroll', debouncedScrollHandlerRef.current, { passive: true })
    }

    return () => {
      debouncedScrollHandlerRef.current?.cancel()
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current)
      }
    }
  }, [loadMore, isLoading, hasMore, isDropdownOpen])

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

          // Clear any pending timeout
          if (loadMoreTimeoutRef.current) {
            clearTimeout(loadMoreTimeoutRef.current)
            loadMoreTimeoutRef.current = null
          }

          // Reset loading states
          isFirstLoadMoreRef.current = true
          isLoadingMoreRef.current = false
          setIsLoadingMore(false)

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
    const timeoutRef = loadMoreTimeoutRef

    return () => {
      const container = containerRef.current
      const scrollHandler = handlerRef.current
      if (container && scrollHandler) {
        container.removeEventListener('scroll', scrollHandler)
      }
      // Cancel the debounced function to prevent stale calls
      scrollHandler?.cancel()
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Only apply fixed height when there are notifications
  const scrollAreaHeight = localNotifications.length > 0 ? 'h-[37.5rem] max-h-[37.5rem]' : ''

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
          <NotificationBellButton unreadNotificationCount={unReadTotal} />
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
              {unReadTotal > 0 && (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    {unReadTotal} {unReadTotal === 1 ? 'unread' : 'unreads'}
                  </span>
                  <NotificationReadAllButton onReadAll={handleReadAllLocal} />
                </div>
              )}
            </div>
          </div>
          <ScrollArea className={cn('rounded-md', scrollAreaHeight)} viewPortRef={notificationContainerRef}>
            <div className="py-1">
              {localNotifications.length === 0 ? (
                <NotificationEmptyState />
              ) : (
                <>
                  <NotificationList notifications={localNotifications} onRead={handleReadLocal} showLoader={false} />
                  {(isLoading || isLoadingMore) && hasMore && (
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
