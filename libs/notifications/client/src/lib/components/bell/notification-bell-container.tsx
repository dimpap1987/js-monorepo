'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@js-monorepo/components/ui/dropdown'
import { ScrollArea } from '@js-monorepo/components/ui/scroll'
import { DpLoadingSpinner } from '@js-monorepo/loader'
import { UserNotificationType } from '@js-monorepo/types/notifications'
import { cn } from '@js-monorepo/ui/util'
import { debounce } from 'lodash'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNotificationContext } from '../../context/notification-context'
import { updateNotificationAsRead } from '../../utils/notifications'
import { NotificationEmptyState } from '../notification-empty-state'
import { NotificationBellButton } from './notification-bell-trigger'
import { NotificationDropdownList } from './notification-list'
import { NotificationReadAllButton } from './notification-read-all'

interface NotificationDropdownProps {
  userId: number | undefined
  initialLimit?: number
  className?: string
  resetOnClose?: boolean
}

const SCROLL_THRESHOLD = 10 // pixels from bottom to trigger load more
const DEBOUNCE_DELAY = 150 // milliseconds
const LOAD_MORE_DELAY = 500 // delay before subsequent load more requests

export function NotificationDropdown({
  userId,
  initialLimit = 15,
  className,
  resetOnClose = true,
}: NotificationDropdownProps) {
  const { notifications, unreadCount, loadMore, hasMore, isLoading, handleRead, handleReadAll } =
    useNotificationContext()

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

  useEffect(() => {
    if (notifications.length > 0) {
      initialNotificationsRef.current = [...notifications]
    }
  }, [notifications])

  useEffect(() => {
    setLocalNotifications([...notifications].sort((a, b) => b.notification.id - a.notification.id))
  }, [notifications])

  useEffect(() => {
    if (unreadCount === 0) {
      setLocalNotifications((prev) => prev.map((content) => ({ ...content, isRead: true })))
    }
  }, [unreadCount])

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

  const handleReadAllLocal = useCallback(async () => {
    try {
      await handleReadAll()
      setLocalNotifications((prev) => prev.map((content) => ({ ...content, isRead: true })))
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }, [handleReadAll])

  useEffect(() => {
    if (!isLoading) {
      isLoadingMoreRef.current = false
      setIsLoadingMore(false)
    }
  }, [isLoading])

  useEffect(() => {
    const oldHandler = debouncedScrollHandlerRef.current
    const container = notificationContainerRef.current

    if (oldHandler && container && isDropdownOpen) {
      container.removeEventListener('scroll', oldHandler)
      oldHandler.cancel()
    }

    debouncedScrollHandlerRef.current = debounce(() => {
      const currentContainer = notificationContainerRef.current
      if (!currentContainer) return

      const { scrollTop, scrollHeight, clientHeight } = currentContainer
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight)

      if (distanceFromBottom <= SCROLL_THRESHOLD && !isLoading && hasMore && !isLoadingMoreRef.current) {
        isLoadingMoreRef.current = true

        if (isFirstLoadMoreRef.current) {
          isFirstLoadMoreRef.current = false
          loadMore()
        } else {
          setIsLoadingMore(true)
          loadMoreTimeoutRef.current = setTimeout(() => {
            loadMore()
          }, LOAD_MORE_DELAY)
        }
      }
    }, DEBOUNCE_DELAY)

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

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsDropdownOpen(open)

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

          if (debouncedScrollHandlerRef.current) {
            container.addEventListener('scroll', debouncedScrollHandlerRef.current, { passive: true })
          }
        } else {
          if (debouncedScrollHandlerRef.current) {
            container.removeEventListener('scroll', debouncedScrollHandlerRef.current)
          }

          if (loadMoreTimeoutRef.current) {
            clearTimeout(loadMoreTimeoutRef.current)
            loadMoreTimeoutRef.current = null
          }

          isFirstLoadMoreRef.current = true
          isLoadingMoreRef.current = false
          setIsLoadingMore(false)

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

  useEffect(() => {
    const containerRef = notificationContainerRef
    const handlerRef = debouncedScrollHandlerRef
    const timeoutRef = loadMoreTimeoutRef

    return () => {
      const container = containerRef.current
      const scrollHandler = handlerRef.current
      if (container && scrollHandler) {
        container.removeEventListener('scroll', scrollHandler)
      }
      scrollHandler?.cancel()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const scrollAreaHeight = localNotifications.length > 4 ? 'h-[37.5rem] max-h-[37.5rem]' : ''

  if (!userId) return null

  return (
    <>
      {isDropdownOpen && (
        <div
          className="fixed inset-0 top-navbar-offset bg-black/40 backdrop-blur-sm z-10 transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      <DropdownMenu onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <NotificationBellButton className="text-2xl" />
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
          <div className="sticky top-0 z-10 bg-background-secondary backdrop-blur-sm border-b border-border-glass px-4 py-3.5">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-foreground tracking-tight">Notifications</h3>
              <div className="flex items-center gap-3">
                {!!unreadCount && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-accent text-primary border border-primary">
                    {unreadCount} {unreadCount === 1 ? 'unread' : 'unreads'}
                  </span>
                )}
                <NotificationReadAllButton disabled={!unreadCount} onReadAll={handleReadAllLocal} />
              </div>
            </div>
          </div>
          <ScrollArea className={cn('rounded-md', scrollAreaHeight)} viewPortRef={notificationContainerRef}>
            <div className="py-1">
              {localNotifications.length === 0 ? (
                <NotificationEmptyState />
              ) : (
                <>
                  <NotificationDropdownList
                    notifications={localNotifications}
                    onRead={handleReadLocal}
                    showLoader={false}
                  />
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
