'use client'

import { UserNotificationType } from '@js-monorepo/types/notifications'
import { cn } from '@js-monorepo/ui/util'
import { useEffect, useRef, useState } from 'react'
import { DpLoadingSpinner } from '@js-monorepo/loader'
import { NotificationEmptyState } from './notification-empty-state'
import { NotificationItem } from './notification-item'

interface NotificationListProps {
  notifications: UserNotificationType[]
  onRead: (id: number) => Promise<void>
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
  className?: string
}

export type { NotificationListProps }

export function NotificationList({
  notifications,
  onRead,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className,
}: NotificationListProps) {
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
            isFirstLoadMoreRef.current = false
            onLoadMore()
          } else {
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
      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationItem key={notification.notification.id} notification={notification} onRead={onRead} />
        ))}
      </div>

      {hasMore && <div ref={sentinelRef} className="h-px" />}

      {(isLoading || isLoadingMore) && (
        <div className="flex items-center justify-center py-6">
          <DpLoadingSpinner message="Loading more..." className="text-sm text-foreground-neutral" />
        </div>
      )}
    </div>
  )
}
