import { DropdownMenuItem } from '@js-monorepo/components/dropdown'
import { UserNotificationType } from '@js-monorepo/types'
import { cn } from '@js-monorepo/ui/util'
import { useRouter } from 'next/navigation'
import React, { useCallback } from 'react'
import { humanatizeNotificationDate } from '../../utils/notifications'
import './bell.css'

interface NotificationDropdownItemProps {
  content: UserNotificationType
  onRead: (id: number) => void
}

const NotificationDropdownItem = React.memo(({ content, onRead }: NotificationDropdownItemProps) => {
  const isUnread = !content.isRead
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
    <DropdownMenuItem
      className={cn(
        'relative cursor-pointer',
        'px-4 py-3.5 rounded-lg mx-1',
        'focus:bg-transparent focus:text-foreground',
        'outline-none',
        'transition-all duration-300 ease-in-out',
        'animate-in fade-in slide-in-from-top-1',
        'hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5',
        'active:scale-[0.99] active:translate-y-0 border border-border-glass',
        isUnread ? 'border-l-4 border-l-primary bg-primary/5 hover:bg-primary/80 hover:border-l-primary' : 'opacity-75'
      )}
      onSelect={(e) => {
        e.preventDefault()
        if (!isUnread) return
        onRead(content.notification.id)
      }}
    >
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 w-full">
        {/* Unread indicator - left border handles this now, but keep spacing */}
        <div className="row-span-2 flex items-center pt-1.5 shrink-0">
          {isUnread && (
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0 shadow-sm shadow-primary/50 animate-pulse" />
          )}
        </div>

        {/* Message content - takes full width of second column */}
        <div
          className={cn(
            'notification-content',
            'text-sm break-words select-text leading-relaxed min-w-0',
            'max-line--height',
            isUnread ? 'text-foreground font-semibold' : 'text-foreground-neutral font-normal',
            'overflow-wrap-anywhere word-break break-word'
          )}
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          onClick={handleContentClick}
          dangerouslySetInnerHTML={{ __html: content.notification?.message }}
        />

        {/* Timestamp - aligned to right in second column */}
        <div className="flex justify-end items-center">
          <span className={cn('text-xs whitespace-nowrap', isUnread ? 'text-foreground' : 'text-foreground-neutral')}>
            {humanatizeNotificationDate(content.notification.createdAt)}
          </span>
        </div>
      </div>
    </DropdownMenuItem>
  )
})

NotificationDropdownItem.displayName = 'NotificationDropdownItem'

export { NotificationDropdownItem }
