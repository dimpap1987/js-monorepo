'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@js-monorepo/components/dropdown'
import { DpLoadingSpinner } from '@js-monorepo/loader'
import { useWebSocket, WebSocketOptionsType } from '@js-monorepo/next/providers'
import { PaginationType, UserNotificationType } from '@js-monorepo/types'
import { cn } from '@js-monorepo/ui/util'
import moment from 'moment'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { GoDotFill } from 'react-icons/go'
import { IoMdNotifications } from 'react-icons/io'
import { MdNotificationsActive } from 'react-icons/md'
import './bell.css'

function humanatizeNotificationDate(content: UserNotificationType) {
  const timeDifference = moment().diff(moment(content.notification.createdAt))
  const formattedDifference = moment.duration(timeDifference).humanize()

  return {
    ...content,
    notification: {
      ...content.notification,
      createdAt: formattedDifference,
    },
  }
}

export const websocketOptions: WebSocketOptionsType = {
  url: process.env['NEXT_PUBLIC_WEBSOCKET_PRESENCE_URL'] ?? '',
}

export function DpNotificationBellComponent({
  pagebale = {
    page: 1,
    content: [],
    pageSize: 15,
    totalCount: 0,
    totalPages: 1,
    unReadTotal: 0,
  },
  className,
  onRead,
  onPaginationChange,
}: {
  pagebale?: PaginationType<UserNotificationType> & { unReadTotal?: number }
  className?: string
  onRead?: (notificationId: number) => Promise<any>
  onPaginationChange?: (pagination: {
    page: number
    pageSize: number
  }) => Promise<void>
}) {
  const [notifications, setNotifications] = useState<UserNotificationType[]>(
    pagebale?.content?.map((content) => humanatizeNotificationDate(content)) ||
      []
  )
  const { isLoggedIn } = useSession()
  const { socket } = useWebSocket(websocketOptions, isLoggedIn)
  const [showLoader, setShowLoader] = useState(false)

  const paginator = useRef({
    page: pagebale?.page || 1,
    pageSize: pagebale?.pageSize || 15,
    totalCount: pagebale?.totalCount || 0,
    totalPages: pagebale?.totalPages || 1,
    unReadTotal: pagebale?.unReadTotal || 0,
  })

  const notificationsLoading = useRef(false)

  const notificationContainerRef = useRef<HTMLDivElement>(null)
  const unreadNotificationCount = paginator.current.unReadTotal
  const isRinging = unreadNotificationCount > 0

  useEffect(() => {
    if (!socket) return
    socket.on('events:notifications', (event) => {
      if (event.data) {
        paginator.current.unReadTotal = paginator.current.unReadTotal + 1
        setNotifications((prev) => [
          humanatizeNotificationDate(event.data),
          ...prev,
        ])
      }
    })
  }, [socket])

  useEffect(() => {
    if (!pagebale) return

    paginator.current = {
      page: pagebale?.page || 1,
      pageSize: pagebale?.pageSize || 15,
      totalCount: pagebale?.totalCount || 0,
      totalPages: pagebale?.totalPages || 1,
      unReadTotal: pagebale?.unReadTotal || 0,
    }

    if (!pagebale.content) return

    setNotifications((prev) => {
      const existingIds = new Set(
        prev.map((content) => content.notification.id)
      ) // Create a Set of existing notification IDs

      // Filter out notifications that are already in the Set
      const newNotifications = pagebale.content
        .filter((content) => !existingIds.has(content.notification.id))
        .map((content) => humanatizeNotificationDate(content))

      return [...prev, ...newNotifications]
    })
  }, [pagebale])

  const handleScroll = useCallback(() => {
    if (notificationContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        notificationContainerRef.current

      // Check if scrolled to the bottom and not already loading more
      if (
        scrollTop + clientHeight >= scrollHeight - 5 &&
        paginator.current.page < paginator.current.totalPages &&
        !notificationsLoading.current // Check if not already loading
      ) {
        notificationsLoading.current = true
        setShowLoader(true)

        setTimeout(() => {
          onPaginationChange?.({
            page: paginator.current.page + 1,
            pageSize: paginator.current.pageSize,
          }).finally(() => {
            setShowLoader(false)
            notificationsLoading.current = false
          })
        }, 300)
      }
    }
  }, [pagebale, notificationsLoading.current, onPaginationChange])

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        setTimeout(() => {
          if (open) {
            notificationContainerRef?.current?.addEventListener(
              'scroll',
              handleScroll
            )
          } else {
            notificationContainerRef?.current?.removeEventListener(
              'scroll',
              handleScroll
            )

            if (notifications.length > 30) {
              setNotifications((prev) => prev.slice(0, 15))
              // Reset paginator state
              paginator.current.page = 1
              paginator.current.pageSize = 15
            }
          }
        }, 200)
      }}
    >
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
          'hidden sm:block p-1 bg-background-secondary mt-4 text-white w-[98svw] sm:w-[650px] xl:w-[850px]',
          className
        )}
      >
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div
          ref={notificationContainerRef}
          className="h-[calc(80vh_-_var(--navbar-height))] max-h-[502px] overflow-x-hidden overflow-y-auto"
        >
          {notifications.length > 0 ? (
            notifications.map((content, index) => (
              <Fragment key={content?.notification?.id}>
                <DropdownMenuItem
                  className={`cursor-pointer p-2 focus:text-white ${content.isRead ? 'opacity-35' : 'bg-background-secondary/70'}`}
                  onSelect={(e) => {
                    e.preventDefault()
                    const notIndex = notifications.findIndex(
                      (item) => item.notification.id === content.notification.id
                    )

                    if (notIndex !== -1) {
                      const newNotifications = [...notifications]
                      newNotifications[notIndex] = {
                        ...newNotifications[notIndex],
                        isRead: true,
                      }
                      setNotifications(newNotifications)
                      if (paginator.current.unReadTotal > 0) {
                        paginator.current.unReadTotal =
                          paginator.current.unReadTotal - 1
                      }
                      if (!content.isRead) {
                        onRead?.(content.notification.id)
                      }
                    }
                  }}
                >
                  <GoDotFill
                    className={`text-2xl mr-2 shrink-0 ${content.isRead ? 'text-gray-500' : 'text-white'}`}
                  />
                  <div className="p-1 max-line--height break-words">
                    {content.notification?.message}
                  </div>
                  <DropdownMenuShortcut>
                    {content.notification?.createdAt as string} ago
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                {index === notifications.length - 1 && showLoader && (
                  <div className="relative flex items-center justify-center py-1">
                    <DpLoadingSpinner
                      message="Loading..."
                      className="text-sm"
                    ></DpLoadingSpinner>
                  </div>
                )}
                {index < notifications.length - 1 && <DropdownMenuSeparator />}
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
