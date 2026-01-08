'use client'

import { DropdownMenuItem } from '@js-monorepo/components/ui/dropdown'
import { UserNotificationType } from '@js-monorepo/types/notifications'
import React from 'react'
import { getNotificationContainerClasses, NotificationContent } from '../notification-content'

interface NotificationDropdownItemProps {
  content: UserNotificationType
  onRead: (id: number) => void
}

export const NotificationDropdownItem = React.memo(function NotificationDropdownItem({
  content,
  onRead,
}: NotificationDropdownItemProps) {
  const isUnread = !content.isRead

  return (
    <DropdownMenuItem
      className={getNotificationContainerClasses(isUnread)}
      onSelect={(e) => {
        e.preventDefault()
        if (isUnread) {
          onRead(content.notification.id)
        }
      }}
    >
      <NotificationContent notification={content} onRead={onRead} compact />
    </DropdownMenuItem>
  )
})
