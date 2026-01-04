'use client'

import { UserNotificationType } from '@js-monorepo/types'
import { cn } from '@js-monorepo/ui/util'
import React from 'react'
import { notificationContainerStyles, NotificationContent } from './notification-content'

interface NotificationItemProps {
  notification: UserNotificationType
  onRead?: (id: number) => Promise<void>
  className?: string
}

export const NotificationItem = React.memo(function NotificationItem({
  notification,
  onRead,
  className,
}: NotificationItemProps) {
  const isUnread = !notification.isRead

  const handleClick = async () => {
    if (isUnread && onRead) {
      await onRead(notification.notification.id)
    }
  }

  return (
    <div
      className={cn(
        notificationContainerStyles.base,
        isUnread ? notificationContainerStyles.unread : notificationContainerStyles.read,
        className
      )}
      onClick={handleClick}
    >
      <NotificationContent notification={notification} onRead={onRead ? (id) => onRead(id) : undefined} />
    </div>
  )
})
