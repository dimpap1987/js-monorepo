'use client'

import { useState } from 'react'
import { IoMdNotifications } from 'react-icons/io'
import { MdNotificationsActive } from 'react-icons/md'
import './bell.css'
import { cn } from '@js-monorepo/utils'

type NotificationType = {
  message: string
  isRead: boolean
}

const notifcationList: NotificationType[] = [
  {
    message: 'User jim has logged in',
    isRead: true,
  },
  {
    message: 'User dimpap has logged in',
    isRead: false,
  },
  {
    message: 'Panatha ole',
    isRead: true,
  },
  {
    message: 'Panatha ole!!!!!',
    isRead: false,
  },
]

function DpNotificationBell({
  notificationList = notifcationList,
  className,
}: {
  notificationList?: NotificationType[]
  className?: string
}) {
  const [notifications, setNotifications] =
    useState<NotificationType[]>(notificationList)
  const notificationCount = notifications?.filter((n) => !n.isRead)?.length
  const isRinging = notificationCount > 0

  return (
    <div className={cn('flex relative cursor-pointer', className)}>
      {/* label */}
      {isRinging && (
        <div className="absolute rounded-full border w-[20px] h-[20px] transform translate-x-4 -translate-y-3 bg-orange-700 border-orange-700 text-white text-sm">
          {notificationCount}
        </div>
      )}

      {/* Bell */}
      {isRinging ? (
        <MdNotificationsActive className="animate-bell text-2xl" />
      ) : (
        <IoMdNotifications className="text-2xl" />
      )}
    </div>
  )
}

export default DpNotificationBell
