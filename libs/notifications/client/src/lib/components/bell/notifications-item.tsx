import { DropdownMenuItem, DropdownMenuShortcut } from '@js-monorepo/components/dropdown'
import { UserNotificationType } from '@js-monorepo/types'
import { cn } from '@js-monorepo/ui/util'
import React from 'react'
import { humanatizeNotificationDate } from '../../utils/notifications'
import './bell.css'

interface NotificationItemProps {
  content: UserNotificationType
  onRead: (id: number) => void
}

const NotificationItem = React.memo(({ content, onRead }: NotificationItemProps) => {
  const isUnread = !content.isRead

  return (
    <DropdownMenuItem
      className={cn(
        'relative cursor-pointer',
        'px-4 py-3.5 rounded-lg',
        'focus:bg-transparent focus:text-foreground',
        'outline-none',
        'border transition-all duration-200',
        'animate-in fade-in slide-in-from-top-1',
        isUnread
          ? 'border-l-4 border-l-primary bg-primary/5 hover:bg-primary/10 border-r border-t border-b border-border'
          : 'border-border bg-transparent hover:bg-background-secondary/30 opacity-75'
      )}
      onSelect={(e) => {
        e.preventDefault()
        if (!isUnread) return
        onRead(content.notification.id)
      }}
    >
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 w-full">
        {/* Unread indicator - left border handles this now, but keep spacing */}
        <div className="row-span-2 flex items-start pt-1.5 shrink-0">
          {isUnread && <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />}
        </div>

        {/* Message content - takes full width of second column */}
        <div
          className={cn(
            'text-sm break-words select-text leading-relaxed min-w-0',
            'max-line--height',
            isUnread ? 'text-foreground font-semibold' : 'text-foreground-neutral font-normal',
            'overflow-wrap-anywhere word-break break-word'
          )}
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          dangerouslySetInnerHTML={{ __html: content.notification?.message }}
        />

        {/* Timestamp - aligned to right in second column */}
        <div className="flex justify-end items-center">
          <span className={cn('text-xs whitespace-nowrap', isUnread ? 'text-foreground' : 'text-foreground-neutral')}>
            {humanatizeNotificationDate(content.notification.createdAt)} ago
          </span>
        </div>
      </div>
    </DropdownMenuItem>
  )
})

NotificationItem.displayName = 'NotificationItem'

export { NotificationItem }
