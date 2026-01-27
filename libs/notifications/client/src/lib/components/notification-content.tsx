'use client'

import { UserNotificationType } from '@js-monorepo/types/notifications'
import { cn } from '@js-monorepo/ui/util'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { MdOpenInNew } from 'react-icons/md'
import { humanatizeNotificationDate } from '../utils/notifications'
import './bell/bell.css'

interface NotificationContentProps {
  notification: UserNotificationType
  onRead?: (id: number) => void
  showReadIndicator?: boolean
  compact?: boolean
}

export function NotificationContent({
  notification,
  onRead,
  showReadIndicator = true,
  compact = false,
}: NotificationContentProps) {
  const isUnread = !notification.isRead
  const router = useRouter()
  const notificationData = notification.notification

  const handleContentClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'A') {
        e.preventDefault()
        e.stopPropagation()
        const href = target.getAttribute('href')
        if (href) {
          if (href.startsWith('/') || !href.startsWith('http')) {
            router.push(href)
          } else {
            window.open(href, '_blank', 'noopener,noreferrer')
          }
        }
      }
    },
    [router]
  )

  const handleLinkClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (notificationData.link) {
        router.push(notificationData.link)
        if (isUnread && onRead) {
          onRead(notificationData.id)
        }
      }
    },
    [router, notificationData.link, notificationData.id, isUnread, onRead]
  )

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Unread indicator dot */}
      {showReadIndicator && (
        <div className="flex-shrink-0 pt-1.5 transform -translate-y-[90%]">
          {isUnread ? <div className="w-2 h-2 rounded-full bg-primary" /> : <div className="w-2 h-2" />}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Link icon */}
        {notificationData.link && (
          <MdOpenInNew
            className="w-4 h-4 absolute text-primary right-2 top-3 cursor-pointer hover:scale-110 transition-transform"
            onClick={handleLinkClick}
          />
        )}

        {/* Message */}
        <div
          className={cn(
            'notification-content notification-message',
            'text-sm break-words select-text leading-relaxed',
            compact && 'max-line--height',
            isUnread ? 'text-foreground font-medium' : 'text-muted-foreground font-normal'
          )}
          onClick={handleContentClick}
          dangerouslySetInnerHTML={{ __html: notificationData.message }}
        />

        {/* Timestamp */}
        <div className="mt-1.5 flex justify-end">
          <span
            className={cn('text-xs whitespace-nowrap', isUnread ? 'text-foreground-muted' : 'text-foreground-neutral')}
          >
            {humanatizeNotificationDate(notificationData.createdAt)}
          </span>
        </div>
      </div>
    </div>
  )
}

// Shared styles for notification containers - clean, professional design
export const notificationContainerStyles = {
  base: ['group relative rounded-md p-4 sm:p-6', 'transition-all duration-200 ease-out', 'border border-border'].join(
    ' '
  ),
  unread: ['cursor-pointer', 'bg-card', 'hover:bg-accent', 'focus:!bg-accent', 'border-l-4', 'border-l-primary'].join(
    ' '
  ),
  read: [
    'bg-muted',
    'hover:bg-accent',
    'focus:!bg-accent',
    '[&_.notification-message]:text-muted-foreground',
    '[&_.notification-message]:font-normal',
  ].join(' '),
}

export function getNotificationContainerClasses(isUnread: boolean, className?: string) {
  return cn(
    notificationContainerStyles.base,
    isUnread ? notificationContainerStyles.unread : notificationContainerStyles.read,
    className
  )
}
