import {
  DropdownMenuItem,
  DropdownMenuShortcut,
} from '@js-monorepo/components/dropdown'
import { UserNotificationType } from '@js-monorepo/types'
import React from 'react'
import { GoDotFill } from 'react-icons/go'
import { humanatizeNotificationDate } from '../../utils/notifications'

interface NotificationItemProps {
  content: UserNotificationType
  onRead: (id: number) => void
}

const NotificationItem = React.memo(
  ({ content, onRead }: NotificationItemProps) => {
    return (
      <DropdownMenuItem
        className={`cursor-pointer rounded p-2 focus:text-white ${content.isRead ? 'opacity-35' : ''}`}
        onSelect={(e) => {
          e.preventDefault()
          if (content.isRead) return
          onRead(content.notification.id)
        }}
      >
        <GoDotFill
          className={`text-2xl mr-2 shrink-0 ${content.isRead ? 'text-gray-500' : 'text-white'}`}
        />
        <div
          className="p-1 max-line--height break-words select-text text-gray-300"
          dangerouslySetInnerHTML={{ __html: content.notification?.message }}
        ></div>
        <DropdownMenuShortcut>
          {humanatizeNotificationDate(content.notification.createdAt)} ago
        </DropdownMenuShortcut>
      </DropdownMenuItem>
    )
  }
)

export { NotificationItem }
