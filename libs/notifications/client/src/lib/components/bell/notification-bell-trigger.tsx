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

  return (
    <button
      className={cn('outline-none py-1 px-2 rounded-md hover:ring-1 hover:ring-border text-2xl', className)}
      tabIndex={0}
      aria-label="toggle user options"
      ref={forwardedRef}
      {...props}
    >
      {isRinging && (
        <div className="absolute flex justify-center items-center z-10 rounded-full border w-[20px] h-[20px] transform translate-x-[0.65rem] -translate-y-[0.5rem] bg-orange-700 border-orange-700 text-white text-[12px]">
          {unreadNotificationCount}
        </div>
      )}

      {/* Bell */}
      {isRinging ? <MdNotificationsActive className="animate-bell" /> : <IoMdNotifications />}
    </button>
  )
})

NotificationBellButton.displayName = 'NotificationBellButton'
