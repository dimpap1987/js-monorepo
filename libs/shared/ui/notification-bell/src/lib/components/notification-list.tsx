import { DropdownMenuSeparator } from '@js-monorepo/components/dropdown'
import { DpLoadingSpinner } from '@js-monorepo/loader'
import { UserNotificationType } from '@js-monorepo/types'
import { Fragment } from 'react'
import './bell.css'
import { NotificationItem } from './notifications-item'

interface NotificationListProps {
  notifications: UserNotificationType[]
  onRead: (id: number) => void
  showLoader: boolean
}

export function NotificationList({
  notifications,
  onRead,
  showLoader,
}: NotificationListProps) {
  return (
    <>
      {notifications?.length > 0 ? (
        notifications.map((content, index) => (
          <Fragment key={content.notification.id}>
            <NotificationItem content={content} onRead={onRead} />
            {/* Show loader at the end of the list */}
            {index === notifications.length - 1 && showLoader && (
              <div className="relative flex items-center justify-center py-1">
                <DpLoadingSpinner message="Loading..." className="text-sm" />
              </div>
            )}
            {/* Add separator between items */}
            {index < notifications.length - 1 && <DropdownMenuSeparator />}
          </Fragment>
        ))
      ) : (
        <div className="p-2 text-sm text-center">
          Nothing to show{' '}
          <span role="img" aria-label="emoji-sad">
            😒
          </span>
        </div>
      )}
    </>
  )
}
