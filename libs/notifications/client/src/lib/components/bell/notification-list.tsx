import { DpLoadingSpinner } from '@js-monorepo/loader'
import { UserNotificationType } from '@js-monorepo/types'
import { memo } from 'react'
import { NotificationItem } from './notifications-item'

interface NotificationListProps {
  notifications: UserNotificationType[]
  onRead: (id: number) => void
  showLoader: boolean
}

function Notifications({ notifications, onRead, showLoader }: NotificationListProps) {
  if (notifications?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <span className="text-4xl mb-4 opacity-50" role="img" aria-label="Bell icon indicating no notifications">
          🔔
        </span>
        <div className="text-sm text-foreground-muted font-medium">No new notifications</div>
        <div className="text-xs text-foreground-neutral/50 mt-1">You're all caught up!</div>
      </div>
    )
  }

  return (
    <div className="space-y-2.5 px-2 py-2">
      {notifications.map((content, index) => (
        <div key={content.notification.id}>
          <NotificationItem content={content} onRead={onRead} />
          {/* Show loader at the end of the list */}
          {index === notifications.length - 1 && showLoader && (
            <div className="flex items-center justify-center py-4">
              <DpLoadingSpinner message="Loading more..." className="text-sm text-foreground-neutral" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export const NotificationList = memo(Notifications)
