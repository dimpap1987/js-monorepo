'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@js-monorepo/dropdown'
import { Fragment, useEffect, useState } from 'react'
import { IoMdNotifications } from 'react-icons/io'
import { MdNotificationsActive } from 'react-icons/md'
import './bell.css'

type NotificationType = {
  id: number
  message: string
  isRead: boolean
  timeAgo: string
}

const notificationListDummy: NotificationType[] = [
  {
    id: 1,
    message: 'User jim has logged in ❤️',
    isRead: false,
    timeAgo: '3days ago',
  },
  {
    id: 2,
    message: 'User dimpap has signed out 👌',
    isRead: false,
    timeAgo: '2days ago',
  },
  {
    id: 3,
    message: 'Panatha ole 🤩',
    isRead: false,
    timeAgo: '1day ago',
  },
  {
    id: 4,
    message: 'Panatha ole!!!!! 😁',
    isRead: false,
    timeAgo: '1min ago',
  },
  {
    id: 5,
    message: 'Panatha ole!!!!! 😁',
    isRead: false,
    timeAgo: '1min ago',
  },
  {
    id: 6,
    message: 'Panatha ole!!!!! 😁',
    isRead: false,
    timeAgo: '1min ago',
  },
  {
    id: 7,
    message: 'Panatha ole!!!!! 😁',
    isRead: true,
    timeAgo: '1min ago',
  },
  {
    id: 8,
    message: 'Panatha ole!!!!! 😁',
    isRead: true,
    timeAgo: '1min ago',
  },
  {
    id: 9,
    message: 'Panatha ole!!!!! 😁',
    isRead: true,
    timeAgo: '1min ago',
  },
]

function DpNotificationBell({
  notificationList = [],
  className,
}: {
  notificationList?: NotificationType[]
  className?: string
}) {
  const [notifications, setNotifications] =
    useState<NotificationType[]>(notificationList)
  const notificationCount = notifications?.filter((n) => !n.isRead)?.length
  const isRinging = notificationCount > 0

  useEffect(() => {
    const eventSource = new EventSource(
      `http://localhost:3333/api/notifications/events`,
      { withCredentials: true }
    )
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      setNotifications((prev) => {
        return [
          {
            id: data.id,
            isRead: false,
            timeAgo: 'now',
            message: data.message,
          },
          ...prev,
        ]
      })
    }
    eventSource.onerror = (message) => {
      console.log(message)
    }

    return () => {
      eventSource.close()
    }
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        <button className="outline-none">
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
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="pl-2 bg-background-secondary mt-3 hidden md:block text-white w-[350px] max-w-[450px]">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[305px] overflow-x-hidden overflow-y-auto">
          {notifications?.length > 0 ? (
            notifications.map((notification, index) => (
              <Fragment key={notification.id}>
                <DropdownMenuItem
                  className={`cursor-pointer focus:text-white ${notification.isRead ? 'opacity-35' : ''}`}
                  onSelect={(event) => {
                    event.preventDefault()
                    const notIndex = notifications.findIndex(
                      (item) => item.id === notification.id
                    )
                    if (notIndex !== -1) {
                      const newNotifications = [...notifications]
                      newNotifications[notIndex] = {
                        ...newNotifications[notIndex],
                        isRead: true,
                      }
                      setNotifications(newNotifications)
                    }
                  }}
                >
                  <span>{notification.message}</span>
                  <DropdownMenuShortcut>
                    {notification.timeAgo}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                {index < notifications.length - 1 && <DropdownMenuSeparator />}
              </Fragment>
            ))
          ) : (
            <div className="p-2">No notifications yet 😒</div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DpNotificationBell
