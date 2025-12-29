'use client'

import { UserNotificationType } from '@js-monorepo/types'
import { cn } from '@js-monorepo/ui/util'
import { useEffect, useRef, useState } from 'react'
import { DpLoadingSpinner } from '@js-monorepo/loader'
import { NotificationEmptyState } from './notification-empty-state'
import { NotificationItem } from './notification-item'

interface NotificationListVirtualProps {
  notifications: UserNotificationType[]
  onRead: (id: number) => Promise<void>
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
  className?: string
}

export type { NotificationListVirtualProps }

export function NotificationListVirtual({
  notifications,
  onRead,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className,
}: NotificationListVirtualProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const isLoadingMoreRef = useRef(false)
  const isFirstLoadMoreRef = useRef(true)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !onLoadMore || !hasMore || isLoading) return

    let timeoutId: NodeJS.Timeout

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoadingMoreRef.current) {
          isLoadingMoreRef.current = true

          if (isFirstLoadMoreRef.current) {
            // First load more - no delay
            isFirstLoadMoreRef.current = false
            onLoadMore()
          } else {
            // Subsequent loads - add delay
            setIsLoadingMore(true)
            timeoutId = setTimeout(() => {
              onLoadMore()
            }, 500)
          }
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => {
      observer.disconnect()
      clearTimeout(timeoutId)
      // Reset loading state on cleanup to handle edge cases
      isLoadingMoreRef.current = false
      setIsLoadingMore(false)
    }
  }, [onLoadMore, hasMore, isLoading])

  if (notifications.length === 0 && !isLoading) {
    return (
      <div className={cn('min-h-[200px]', className)}>
        <NotificationEmptyState />
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="space-y-1 px-2">
        {notifications.map((notification) => (
          <NotificationItem key={notification.notification.id} notification={notification} onRead={onRead} />
        ))}
      </div>

      {/* Sentinel - when visible, triggers load more */}
      {hasMore && <div ref={sentinelRef} className="h-px" />}

      {(isLoading || isLoadingMore) && (
        <div className="flex items-center justify-center py-6">
          <DpLoadingSpinner message="Loading more..." className="text-sm text-foreground-neutral" />
        </div>
      )}
    </div>
  )
}
