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
import moment from 'moment'
import { Fragment, useEffect, useState } from 'react'
import { IoMdInformationCircle, IoMdNotifications } from 'react-icons/io'
import { MdNotificationsActive } from 'react-icons/md'
import './bell.css'
import { cn } from '@js-monorepo/utils'

type NotificationType = {
  id: number
  message: string
  isRead: boolean
  time: any
  formattedTime: string
}

export function DpNotificationBellComponent({
  notificationList = [],
  className,
}: {
  notificationList?: NotificationType[]
  className?: string
}) {
  const [notifications, setNotifications] =
    useState<NotificationType[]>(notificationList)
  const unreadNotificationCount = notifications?.filter(
    (n) => !n.isRead
  )?.length
  const isRinging = unreadNotificationCount > 0

  useEffect(() => {
    const eventSource = new EventSource(
      process.env.NEXT_PUBLIC_NOTIFICATION_CONTROLLER ?? '',
      { withCredentials: true }
    )
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const timeDifference = moment().diff(moment(data.time))
      const formattedDifference = moment.duration(timeDifference).humanize()

      setNotifications((prev) => {
        return [
          {
            id: data.id,
            isRead: false,
            time: data.time,
            formattedTime: formattedDifference,
            message: data.message,
          },
          ...prev,
        ]
      })
    }
    return () => {
      eventSource.close()
    }
  }, [])

  useEffect(() => {
    if (!(notifications?.length > 0)) return
    const interval = setInterval(() => {
      setNotifications((prev) => {
        const newNotificaitons = prev.map((not) => {
          const timeDifference = moment().diff(moment(not.time))
          const formattedDifference = moment.duration(timeDifference).humanize()
          return {
            ...not,
            formattedTime: formattedDifference,
          }
        })
        return [...newNotificaitons]
      })
    }, 60000)
    return () => clearInterval(interval)
  }, [notifications])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={cn('px-1', className)}>
        <button className="outline-none">
          {isRinging && (
            <div className="absolute rounded-full border w-[20px] h-[20px] transform translate-x-4 -translate-y-3 bg-orange-700 border-orange-700 text-white text-sm">
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
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-1 bg-background-secondary mt-3 hidden md:block text-white w-[430px]">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[320px] overflow-x-hidden overflow-y-auto">
          {notifications?.length > 0 ? (
            notifications.map((notification, index) => (
              <Fragment key={notification.id}>
                <DropdownMenuItem
                  className={`cursor-pointer p-2 focus:text-white ${notification.isRead ? 'opacity-35' : 'bg-background-secondary-lighter'}`}
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
                  <IoMdInformationCircle className="text-2xl mr-2 shrink-0" />
                  <div className="p-0 max-line--height">
                    {notification.message}
                  </div>
                  <DropdownMenuShortcut>
                    {notification.formattedTime}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                {index < notifications.length - 1 && <DropdownMenuSeparator />}
              </Fragment>
            ))
          ) : (
            <div className="p-2 text-sm">
              No notifications yet{' '}
              <span role="img" aria-label="emoji-sad">
                😒
              </span>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
