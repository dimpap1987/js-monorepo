'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@js-monorepo/components/dropdown'
import { UserNotificationType } from '@js-monorepo/types'
import { cn } from '@js-monorepo/ui/util'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { NotificationBellButton } from './bell/notification-bell-trigger'
import { NotificationReadAllButton } from './bell/notification-read-all'
import { NotificationItem } from './bell/notifications-item'
import { updateNotificationAsRead } from '../utils/notifications'
import { DpLoadingSpinner } from '@js-monorepo/loader'

interface DpNotificationBellVirtualScrollComponentProps {
  notificationList: UserNotificationType[]
  unreadNotificationCount: number
  latestReadNotificationId?: number
  className?: string
  onRead?: (notificationId: number) => Promise<any>
  onReadAll?: () => Promise<boolean>
  onLoadMore?: (cursor: number | null) => Promise<void>
  hasMore?: boolean
  isLoading?: boolean
  resetOnClose?: boolean
}

const ITEM_HEIGHT_ESTIMATE = 73
const OVERSCAN = 5

export function DpNotificationBellVirtualScrollComponent({
  notificationList,
  unreadNotificationCount,
  latestReadNotificationId,
  className,
  onRead,
  onReadAll,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  resetOnClose = false,
}: DpNotificationBellVirtualScrollComponentProps) {
  const [notifications, setNotifications] = useState<UserNotificationType[]>(() =>
    [...notificationList].sort((a, b) => b.notification.id - a.notification.id)
  )
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const parentRef = useRef<HTMLDivElement>(null)
  const initialNotificationsRef = useRef<UserNotificationType[]>(notificationList)

  useEffect(() => {
    if (notificationList.length > 0) {
      initialNotificationsRef.current = [...notificationList]
    }
  }, [notificationList])

  useEffect(() => {
    setNotifications([...notificationList].sort((a, b) => b.notification.id - a.notification.id))
  }, [notificationList])

  useEffect(() => {
    if (latestReadNotificationId) {
      setNotifications((prev) => updateNotificationAsRead(prev, latestReadNotificationId))
    }
  }, [latestReadNotificationId])

  useEffect(() => {
    if (unreadNotificationCount === 0) {
      setNotifications((prev) => prev.map((content) => ({ ...content, isRead: true })))
    }
  }, [unreadNotificationCount])

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

  const virtualizer = useVirtualizer({
    count: notifications.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT_ESTIMATE,
    overscan: OVERSCAN,
  })

  const isLoadingRef = useRef(false)

  useEffect(() => {
    if (!isDropdownOpen || !onLoadMore || !hasMore || isLoading || isLoadingRef.current) return

    const scrollElement = parentRef.current
    if (!scrollElement) return

    const handleScroll = () => {
      if (isLoadingRef.current) return

      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight)

      if (distanceFromBottom < 200) {
        const lastNotification = notifications[notifications.length - 1]
        if (lastNotification && !isLoadingRef.current) {
          isLoadingRef.current = true
          onLoadMore(lastNotification.notification.id).finally(() => {
            isLoadingRef.current = false
          })
        }
      }
    }

    scrollElement.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll)
    }
  }, [isDropdownOpen, onLoadMore, hasMore, isLoading, notifications])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsDropdownOpen(open)

      if (open) {
        requestAnimationFrame(() => {
          if (parentRef.current) {
            parentRef.current.scrollTop = 0
          }
        })
      } else {
        if (resetOnClose) {
          setNotifications([...initialNotificationsRef.current].sort((a, b) => b.notification.id - a.notification.id))
        }
      }
    },
    [resetOnClose]
  )

  const emptyState = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
        <div className="text-sm text-foreground-muted">No new notifications</div>
        <div className="text-xs text-foreground-neutral/50 mt-1">You're all caught up!</div>
      </div>
    ),
    []
  )

  return (
    <>
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
          <div className="sticky top-0 z-10 bg-background-secondary/95 backdrop-blur-sm border-b border-border-glass px-4 py-3.5">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-foreground tracking-tight">Notifications</h3>
              {unreadNotificationCount > 0 && (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    {unreadNotificationCount} {unreadNotificationCount === 1 ? 'unread' : 'unreads'}
                  </span>
                  <NotificationReadAllButton onReadAll={handleReadAll} />
                </div>
              )}
            </div>
          </div>

          <div
            ref={parentRef}
            className={cn('overflow-auto', notifications.length === 0 ? '' : 'h-[37.5rem] max-h-[37.5rem]')}
          >
            {notifications.length === 0 ? (
              emptyState
            ) : (
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const notification = notifications[virtualItem.index]
                  const isFirstItem = virtualItem.index === 0
                  return (
                    <div
                      key={virtualItem.key}
                      data-index={virtualItem.index}
                      ref={(el) => {
                        if (el) {
                          virtualizer.measureElement(el)
                        }
                      }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      <div className={cn('mb-2', isFirstItem && 'mt-2')}>
                        <NotificationItem content={notification} onRead={handleRead} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {isLoading && hasMore && (
              <div className="flex items-center justify-center py-4">
                <DpLoadingSpinner message="Loading more..." className="text-sm text-foreground-neutral" />
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
