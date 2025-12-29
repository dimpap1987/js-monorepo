'use client'

import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import { DpLoadingSpinner } from '@js-monorepo/loader'
import { useNotificationContext } from '../context/notification-context'
import { cn } from '@js-monorepo/ui/util'
import { NotificationReadAllButton } from './bell/notification-read-all'
import { NotificationList } from './notification-list-virtual'

interface NotificationPageProps {
  userId: number
  className?: string
  headerClassName?: string
  showBackArrow?: boolean
}

export function NotificationPage({ userId, className, headerClassName, showBackArrow = true }: NotificationPageProps) {
  const { notifications, unreadCount, loadMore, hasMore, isLoading, handleRead, handleReadAll } =
    useNotificationContext()

  const isInitialLoading = isLoading && notifications.length === 0

  return (
    <div className={cn('text-sm sm:text-base select-none', className)}>
      <div className={cn('flex justify-between items-center mb-4 sm:mb-6 px-2', headerClassName)}>
        {showBackArrow ? (
          <BackArrowWithLabel className="flex-1" arrowClassName="sm:hidden">
            <h3>Notifications</h3>
          </BackArrowWithLabel>
        ) : (
          <h3 className="flex-1 font-semibold">Notifications</h3>
        )}

        <NotificationReadAllButton
          onReadAll={async () => {
            if (unreadCount > 0) {
              await handleReadAll()
            }
          }}
        />
      </div>

      {isInitialLoading ? (
        <div className="flex justify-center items-center py-16">
          <DpLoadingSpinner message="Loading notifications..." className="text-sm text-foreground-muted" />
        </div>
      ) : (
        <NotificationList
          notifications={notifications}
          onRead={async (id) => {
            await handleRead(id)
          }}
          onLoadMore={loadMore}
          hasMore={hasMore}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
