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
        'relative outline-none p-2 rounded-lg',
        'text-2xl text-foreground-neutral hover:text-foreground',
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
        {isRinging ? (
          <MdNotificationsActive className="text-foreground animate-notification-pulse" />
        ) : (
          <IoMdNotifications className="text-foreground-neutral" />
        )}
      </div>

      {/* Badge */}
      {isRinging && (
        <div
          className={cn(
            'absolute -top-1 -right-1 min-w-[18px] h-[18px]',
            'flex items-center justify-center',
            'rounded-full text-[10px] font-semibold',
            'bg-gradient-to-br from-primary to-primary/90',
            'text-primary-foreground shadow-lg',
            'border-2 border-background-secondary',
            'animate-pulse',
            unreadNotificationCount > 9 && 'px-1'
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
