'use client'

import { forwardRef } from 'react'
import { IoMdNotifications } from 'react-icons/io'
import { MdNotificationsActive } from 'react-icons/md'
import './bell.css'

export const NotificationBellButton = forwardRef<
  HTMLButtonElement,
  {
    unreadNotificationCount: number
  }
>(({ unreadNotificationCount = 0, ...props }, forwardedRef) => {
  const isRinging = unreadNotificationCount > 0

  return (
    <button className="outline-none" ref={forwardedRef} {...props}>
      {isRinging && (
        <div className="absolute z-10 rounded-full border w-[20px] h-[20px] transform translate-x-[0.65rem] -translate-y-[0.5rem] bg-orange-700 border-orange-700 text-white text-[14px]">
          {unreadNotificationCount}
        </div>
      )}

      {/* Bell */}
      {isRinging ? (
        <MdNotificationsActive className="animate-bell text-2xl" />
      ) : (
        <IoMdNotifications className="text-2xl" />
      )}
    </button>
  )
})

NotificationBellButton.displayName = 'NotificationBellButton'
