'use client'

import { useSession } from '@js-monorepo/auth-client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@js-monorepo/components'
import { cn } from '@js-monorepo/ui/util'
import moment from 'moment'
import { Fragment, useEffect, useState } from 'react'
import { GoDotFill } from 'react-icons/go'
import { IoMdNotifications } from 'react-icons/io'
import { MdNotificationsActive } from 'react-icons/md'
import './bell.css'

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
  const { isLoggedIn } = useSession()
  const [notifications, setNotifications] =
    useState<NotificationType[]>(notificationList)
  const unreadNotificationCount = notifications?.filter(
    (n) => !n.isRead
  )?.length
  const isRinging = unreadNotificationCount > 0

  useEffect(() => {
    if (!isLoggedIn) return

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
      eventSource?.close()
    }
  }, [isLoggedIn])

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
      <DropdownMenuTrigger asChild className="px-1">
        <button className="outline-none">
          {isRinging && (
            <div className="absolute z-10 rounded-full border w-[20px] h-[20px] transform translate-x-[0.65rem] -translate-y-[0.5rem] bg-orange-700 border-orange-700 text-white text-sm">
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
      <DropdownMenuContent
        className={cn(
          'p-1 bg-background-secondary mt-3 text-white w-[460px] xl:w-[640px]',
          className
        )}
      >
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
                  <GoDotFill
                    className={`text-2xl mr-2 shrink-0 ${notification.isRead ? ' text-gray-500' : 'text-white'}`}
                  />
                  <div className="p-0 max-line--height">
                    {notification.message}
                  </div>
                  <DropdownMenuShortcut>
                    {notification.formattedTime} ago
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                {index < notifications?.length - 1 && <DropdownMenuSeparator />}
              </Fragment>
            ))
          ) : (
            <div className="p-2 text-sm">
              Nothing to show{' '}
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
