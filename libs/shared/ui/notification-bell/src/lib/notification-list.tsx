import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from '@js-monorepo/components/dropdown'
import { DpLoadingSpinner } from '@js-monorepo/loader'
import { UserNotificationType } from '@js-monorepo/types'
import { Fragment } from 'react'
import { GoDotFill } from 'react-icons/go'
import './bell.css'
import { humanatizeNotificationDate } from './utils'

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
            <DropdownMenuItem
              className={`cursor-pointer p-2 focus:text-white ${content.isRead ? 'opacity-35' : ''}`}
              onSelect={(e) => {
                e.preventDefault()
                if (content.isRead) return
                onRead(content.notification.id)
              }}
            >
              <GoDotFill
                className={`text-2xl mr-2 shrink-0 ${content.isRead ? 'text-gray-500' : 'text-white'}`}
              />
              <div className="p-1 max-line--height break-words">
                {content.notification.message}
              </div>
              <DropdownMenuShortcut>
                {humanatizeNotificationDate(content.notification.createdAt)} ago
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            {index === notifications.length - 1 && showLoader && (
              <div className="relative flex items-center justify-center py-1">
                <DpLoadingSpinner
                  message="Loading..."
                  className="text-sm"
                ></DpLoadingSpinner>
              </div>
            )}
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
