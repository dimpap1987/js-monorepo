import { DpLoadingSpinner } from '@js-monorepo/loader'
import { UserNotificationType } from '@js-monorepo/types/notifications'
import { memo } from 'react'
import { NotificationEmptyState } from '../notification-empty-state'
import { NotificationDropdownItem } from './notification-dropdown-item'

interface NotificationDropdownListProps {
  notifications: UserNotificationType[]
  onRead: (id: number) => void
  showLoader: boolean
}

function Notifications({ notifications, onRead, showLoader }: NotificationDropdownListProps) {
  if (notifications?.length === 0) {
    return <NotificationEmptyState />
  }

  return (
    <div className="space-y-2.5 px-2 py-2 mr-2">
      {notifications.map((content, index) => (
        <div key={content.notification.id}>
          <NotificationDropdownItem content={content} onRead={onRead} />
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

export const NotificationDropdownList = memo(Notifications)
