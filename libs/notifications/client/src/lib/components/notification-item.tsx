'use client'

import { UserNotificationType } from '@js-monorepo/types'
import { cn } from '@js-monorepo/ui/util'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { GoDotFill } from 'react-icons/go'
import { humanatizeNotificationDate } from '../utils/notifications'
import './bell/bell.css'

interface NotificationItemProps {
  notification: UserNotificationType
  onRead?: (id: number) => Promise<void>
  className?: string
}

export function NotificationItem({ notification, onRead, className }: NotificationItemProps) {
  const isUnread = !notification.isRead
  const router = useRouter()

  // Handle clicks on links inside notification content for client-side navigation
  const handleContentClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'A') {
        e.preventDefault()
        e.stopPropagation()
        const href = target.getAttribute('href')
        if (href) {
          // Check if it's an internal link (starts with / or is relative)
          if (href.startsWith('/') || !href.startsWith('http')) {
            router.push(href)
          } else {
            // External link - open in new tab
            window.open(href, '_blank', 'noopener,noreferrer')
          }
        }
      }
    },
    [router]
  )

  return (
    <div
      className={cn(
        'group relative cursor-pointer rounded-lg p-3 sm:p-4 transition-all duration-200',
        'border border-border-glass hover:border-border',
        'hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5',
        'active:scale-[0.99]',
        isUnread
          ? 'bg-primary/5 border-l-4 border-l-primary hover:bg-primary/10 hover:border-l-primary/80'
          : 'bg-card/50 opacity-75 hover:opacity-100 hover:bg-card',
        className
      )}
      onClick={async () => {
        if (isUnread && onRead) {
          await onRead(notification.notification.id)
        }
      }}
    >
      <div className="flex items-center gap-3">
        {/* Unread indicator */}
        <div className="flex-shrink-0 pt-1">
          {isUnread ? (
            <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm shadow-primary/50 animate-pulse" />
          ) : (
            <GoDotFill className="text-xs text-foreground-muted" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              'notification-content',
              'text-sm sm:text-base break-words select-text leading-relaxed',
              'overflow-wrap-anywhere word-break break-word',
              isUnread ? 'text-foreground font-semibold' : 'text-foreground-muted font-normal'
            )}
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{
              __html: notification.notification?.message,
            }}
          />
          <div className="mt-2 flex items-center justify-end">
            <span
              className={cn(
                'text-xs sm:text-sm whitespace-nowrap',
                isUnread ? 'text-foreground-muted' : 'text-foreground-neutral'
              )}
            >
              {humanatizeNotificationDate(notification?.notification?.createdAt || '')} ago
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
