'use client'

import { UserNotificationType } from '@js-monorepo/types'
import { cn } from '@js-monorepo/ui/util'
import { useVirtualizer } from '@tanstack/react-virtual'
import { GoDotFill } from 'react-icons/go'
import { useEffect, useMemo, useRef } from 'react'
import { DpLoadingSpinner } from '@js-monorepo/loader'
import { humanatizeNotificationDate } from '../utils/notifications'
import { NotificationEmptyState } from './notification-empty-state'
import { debounce } from 'lodash'

interface NotificationListVirtualProps {
  notifications: UserNotificationType[]
  onRead: (id: number) => Promise<any>
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
  className?: string
  emptyState?: React.ReactNode
  scrollElementRef?: React.RefObject<HTMLDivElement>
}

const ITEM_HEIGHT_ESTIMATE = 73
const OVERSCAN = 5
const SCROLL_THRESHOLD = 200 // pixels from bottom to trigger load more
const DEBOUNCE_DELAY = 150 // milliseconds

export function NotificationListVirtual({
  notifications,
  onRead,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className,
  emptyState,
  scrollElementRef,
}: NotificationListVirtualProps) {
  const isLoadingRef = useRef(false)
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const debouncedScrollHandlerRef = useRef<ReturnType<typeof debounce> | null>(null)
  const totalSizeRef = useRef(0)

  const virtualizer = useVirtualizer({
    count: notifications.length,
    getScrollElement: () => scrollElementRef?.current || null,
    estimateSize: () => ITEM_HEIGHT_ESTIMATE,
    overscan: OVERSCAN,
  })

  // Track total size changes to trigger scroll check
  useEffect(() => {
    const currentTotalSize = virtualizer.getTotalSize()
    if (currentTotalSize !== totalSizeRef.current) {
      totalSizeRef.current = currentTotalSize
      // Trigger scroll check when content size changes
      setTimeout(() => {
        debouncedScrollHandlerRef.current?.()
      }, 100)
    }
  }, [virtualizer, notifications.length])

  // Measure items after they're rendered
  useEffect(() => {
    // Use double deferral to avoid flushSync warnings
    const rafId = requestAnimationFrame(() => {
      setTimeout(() => {
        const virtualItems = virtualizer.getVirtualItems()
        virtualItems.forEach((virtualItem) => {
          const element = itemRefs.current.get(virtualItem.index)
          if (element) {
            try {
              virtualizer.measureElement(element)
            } catch (error) {
              // Ignore measurement errors
            }
          }
        })
      }, 0)
    })

    return () => cancelAnimationFrame(rafId)
  }, [virtualizer, notifications.length])

  // Handle infinite scroll - following the pattern from notification-bell-container-scroll.tsx
  useEffect(() => {
    console.log('[NotificationListVirtual] Scroll effect triggered', {
      hasOnLoadMore: !!onLoadMore,
      hasMore,
      isLoading,
      isLoadingRef: isLoadingRef.current,
      scrollElementExists: !!scrollElementRef?.current,
    })

    if (!onLoadMore || !hasMore || isLoading || isLoadingRef.current) {
      console.log('[NotificationListVirtual] Early return from scroll effect', {
        hasOnLoadMore: !!onLoadMore,
        hasMore,
        isLoading,
        isLoadingRef: isLoadingRef.current,
      })
      return
    }

    const scrollElement = scrollElementRef?.current
    if (!scrollElement) {
      console.log('[NotificationListVirtual] No scroll element found')
      return
    }

    console.log('[NotificationListVirtual] Setting up scroll handler', {
      scrollElement: scrollElement.tagName,
      scrollHeight: scrollElement.scrollHeight,
      clientHeight: scrollElement.clientHeight,
    })

    // Clean up old handler
    const oldHandler = debouncedScrollHandlerRef.current
    if (oldHandler && scrollElement) {
      scrollElement.removeEventListener('scroll', oldHandler)
      oldHandler.cancel()
    }

    // Create new debounced handler
    debouncedScrollHandlerRef.current = debounce(() => {
      console.log('[NotificationListVirtual] Scroll handler fired')
      const currentScrollElement = scrollElementRef?.current
      if (!currentScrollElement) {
        console.log('[NotificationListVirtual] No scroll element in handler')
        return
      }

      if (isLoadingRef.current) {
        console.log('[NotificationListVirtual] Already loading, skipping')
        return
      }

      const { scrollTop, scrollHeight, clientHeight } = currentScrollElement
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight)

      console.log('[NotificationListVirtual] Scroll metrics', {
        scrollTop,
        scrollHeight,
        clientHeight,
        distanceFromBottom,
        threshold: SCROLL_THRESHOLD,
        hasMore,
        isLoading,
        notificationsCount: notifications.length,
      })

      // Trigger load more when near bottom and not already loading
      if (distanceFromBottom <= SCROLL_THRESHOLD && !isLoading && hasMore) {
        const lastNotification = notifications[notifications.length - 1]
        console.log('[NotificationListVirtual] Should load more', {
          lastNotificationId: lastNotification?.notification.id,
          hasLastNotification: !!lastNotification,
        })
        if (lastNotification && !isLoadingRef.current) {
          console.log('[NotificationListVirtual] Calling onLoadMore')
          isLoadingRef.current = true
          onLoadMore()
          setTimeout(() => {
            isLoadingRef.current = false
          }, 1000)
        }
      } else {
        console.log('[NotificationListVirtual] Not loading more', {
          distanceFromBottom,
          threshold: SCROLL_THRESHOLD,
          condition: distanceFromBottom <= SCROLL_THRESHOLD,
          hasMore,
          isLoading,
        })
      }
    }, DEBOUNCE_DELAY)

    // Attach new handler
    if (debouncedScrollHandlerRef.current && scrollElement) {
      scrollElement.addEventListener('scroll', debouncedScrollHandlerRef.current, { passive: true })
      console.log('[NotificationListVirtual] Scroll handler attached')
    }

    return () => {
      console.log('[NotificationListVirtual] Cleaning up scroll handler')
      if (scrollElement && debouncedScrollHandlerRef.current) {
        scrollElement.removeEventListener('scroll', debouncedScrollHandlerRef.current)
      }
      debouncedScrollHandlerRef.current?.cancel()
    }
  }, [onLoadMore, hasMore, isLoading, scrollElementRef, notifications])

  const defaultEmptyState = useMemo(() => <NotificationEmptyState />, [])

  if (notifications.length === 0) {
    return <div className={cn('h-full', className)}>{emptyState || defaultEmptyState}</div>
  }

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  return (
    <div className={cn('w-full', className)}>
      <div
        style={{
          height: `${totalSize}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const notification = notifications[virtualItem.index]
          const isUnread = !notification.isRead
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={(el) => {
                if (el) {
                  itemRefs.current.set(virtualItem.index, el)
                } else {
                  itemRefs.current.delete(virtualItem.index)
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
              <div
                className={cn(
                  'group relative cursor-pointer rounded-lg p-3 sm:p-4 transition-all duration-200 mx-2 my-2',
                  'border border-border-glass hover:border-border',
                  'hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5',
                  'active:scale-[0.99]',
                  isUnread
                    ? 'bg-primary/5 border-l-4 border-l-primary hover:bg-primary/10 hover:border-l-primary/80'
                    : 'bg-card/50 opacity-75 hover:opacity-100 hover:bg-card'
                )}
                onClick={async () => {
                  if (!notification.isRead) {
                    await onRead(notification.notification.id)
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Unread indicator */}
                  <div className="flex-shrink-0 pt-1">
                    {isUnread ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm shadow-primary/50 animate-pulse" />
                    ) : (
                      <GoDotFill className="text-xs text-foreground-muted" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        'text-sm sm:text-base break-words select-text leading-relaxed',
                        'overflow-wrap-anywhere word-break break-word',
                        isUnread ? 'text-foreground font-semibold' : 'text-foreground-muted font-normal'
                      )}
                      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                      dangerouslySetInnerHTML={{
                        __html: notification.notification?.message,
                      }}
                    />
                    <div className="mt-2 flex items-center justify-end">
                      <span
                        className={cn(
                          'text-xs sm:text-sm whitespace-nowrap',
                          isUnread ? 'text-foreground-muted' : 'text-foreground-neutral'
                        )}
                      >
                        {humanatizeNotificationDate(notification?.notification?.createdAt || '')} ago
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {isLoading && hasMore && (
        <div className="flex items-center justify-center py-4">
          <DpLoadingSpinner message="Loading more..." className="text-sm text-foreground-neutral" />
        </div>
      )}
    </div>
  )
}
