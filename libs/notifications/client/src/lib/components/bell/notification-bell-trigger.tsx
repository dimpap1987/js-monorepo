'use client'

import { cn } from '@js-monorepo/ui/util'
import { forwardRef } from 'react'
import { IoMdNotifications } from 'react-icons/io'
import { MdNotificationsActive } from 'react-icons/md'
import './bell.css'
import { useNotificationContext } from '../../context/notification-context'

export const NotificationBellButton = forwardRef<
  HTMLButtonElement,
  {
    className?: string
  }
>(({ className, ...props }, forwardedRef) => {
  const { unreadCount: unreadNotificationCount } = useNotificationContext()
  const isRinging = unreadNotificationCount > 0
  const badgeCount = unreadNotificationCount > 99 ? '99+' : unreadNotificationCount

  return (
    <button
      className={cn(
        'relative outline-none rounded-lg',
        'text-2xl text-foreground',
        'transition-all duration-200 ease-in-out',
        'hover:bg-background-secondary active:bg-accent',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
      tabIndex={0}
      aria-label={`Notifications${unreadNotificationCount > 0 ? ` (${unreadNotificationCount} unread)` : ''}`}
      aria-live="polite"
      ref={forwardedRef}
      {...props}
    >
      {/* Bell icon */}
      <div className="relative">
        {isRinging ? <MdNotificationsActive className="animate-notification-pulse" /> : <IoMdNotifications />}
      </div>

      {/* Badge */}
      {isRinging && (
        <span
          className={cn(
            'absolute -top-1.5 -right-2.5',
            'min-w-[18px] h-[18px] px-1',
            'flex items-center justify-center',
            'rounded-full',
            'text-[10px] font-semibold leading-none',
            'bg-destructive text-destructive-foreground',
            'border-2 border-background',
            'animate-badge-pop'
          )}
          aria-hidden="true"
        >
          {badgeCount}
        </span>
      )}
    </button>
  )
})

NotificationBellButton.displayName = 'NotificationBellButton'
