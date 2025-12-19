'use client'

import { cn } from '@js-monorepo/ui/util'
import { forwardRef } from 'react'
import { IoMdNotifications } from 'react-icons/io'
import { MdNotificationsActive } from 'react-icons/md'
import './bell.css'

export const NotificationBellButton = forwardRef<
  HTMLButtonElement,
  {
    unreadNotificationCount: number
    className?: string
  }
>(({ unreadNotificationCount = 0, className, ...props }, forwardedRef) => {
  const isRinging = unreadNotificationCount > 0
  const badgeCount = unreadNotificationCount > 99 ? '99+' : unreadNotificationCount

  return (
    <button
      className={cn(
        'relative outline-none rounded-lg',
        'text-2xl text-foreground',
        'transition-all duration-200 ease-in-out',
        'hover:bg-background-secondary/50 active:bg-background-secondary/70',
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
        <div
          className={cn(
            'absolute -top-2 -right-3 min-w-[20px] h-[20px]',
            'flex items-center justify-center',
            'rounded-full text-[11px] font-bold tracking-tight',
            'bg-primary text-primary-foreground',
            'shadow-md shadow-primary/30',
            'border-2 border-background',
            'ring-2 ring-primary/20',
            'hover:scale-110 hover:shadow-lg hover:shadow-primary/40'
          )}
          aria-label={`${unreadNotificationCount} unread notifications`}
        >
          {badgeCount}
        </div>
      )}
    </button>
  )
})

NotificationBellButton.displayName = 'NotificationBellButton'
