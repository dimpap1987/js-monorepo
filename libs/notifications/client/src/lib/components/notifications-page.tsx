'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import { DpLoadingSpinner } from '@js-monorepo/loader'
import { cn } from '@js-monorepo/ui/util'
import { useNotificationCursor } from '../hooks/use-notification-cursor'
import { NotificationReadAllButton } from './bell/notification-read-all'
import { NotificationListVirtual } from './notification-list-virtual'

interface NotificationsPageProps {
  className?: string
  headerClassName?: string
  showBackArrow?: boolean
}

export function NotificationsPage({ className, headerClassName, showBackArrow = true }: NotificationsPageProps) {
  const { session } = useSession()
  const user = session?.user

  const { notifications, unReadTotal, loadMore, hasMore, isLoading, handleRead, handleReadAll } = useNotificationCursor(
    {
      userId: user?.id,
    }
  )

  const isInitialLoading = isLoading && notifications.length === 0

  return (
    <div className={cn('text-sm sm:text-base select-none', className)}>
      {/* Header */}
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
            if (unReadTotal > 0) {
              await handleReadAll()
            }
          }}
        />
      </div>

      {/* Content */}
      {isInitialLoading ? (
        <div className="flex justify-center items-center py-16">
          <DpLoadingSpinner message="Loading notifications..." className="text-sm text-foreground-muted" />
        </div>
      ) : (
        <NotificationListVirtual
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
