'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { useLoader } from '@js-monorepo/loader'
import { usePaginationWithParams } from '@js-monorepo/next/hooks/pagination'
import { useWebSocket } from '@js-monorepo/next/providers'
import { humanatizeNotificationDate } from '@js-monorepo/notification-bell'
import { PaginationType, UserNotificationType } from '@js-monorepo/types'
import { wait } from '@js-monorepo/utils/common'
import {
  fetchUserNotifications,
  readNotification,
} from '@next-app/utils/notifications'
import { websocketOptions } from '@next-app/utils/websocket.config'
import { Fragment, useEffect, useRef, useState } from 'react'
import { GoDotFill } from 'react-icons/go'

export function NotificationList() {
  const { user } = useSession()
  const [notifications, setNotifications] = useState<
    PaginationType | undefined
  >()

  const { socket } = useWebSocket(websocketOptions, true)
  const { setLoaderState } = useLoader()
  const { pagination, searchQuery, setPagination } = usePaginationWithParams(
    1,
    50
  )

  const loadingRef = useRef(true)

  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      try {
        loadingRef.current = true
        setLoaderState({
          show: true,
          message: 'Loading...',
          description: 'Notifications',
        })
        const response = await fetchUserNotifications(user.id, searchQuery)
        if (response.ok) {
          setNotifications(
            response.data as PaginationType<UserNotificationType>
          )
        }
        await wait(300)
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      } finally {
        setLoaderState({
          show: false,
        })
        loadingRef.current = false
      }
    }

    fetchNotifications()
  }, [user, searchQuery])

  useEffect(() => {
    if (!socket) return
    socket.on('events:notifications', (event) => {
      if (event.data) {
        setNotifications((prev) => {
          return {
            page: prev?.page ?? 1,
            pageSize: prev?.pageSize ?? 50,
            totalPages: prev?.totalPages ?? 0,
            totalCount: prev?.totalCount ? prev.totalCount + 1 : 1,
            content: prev?.content
              ? [event.data, ...prev.content]
              : [event.data],
          }
        })
      }
    })
  }, [socket])

  if (loadingRef.current) return null

  return (
    <div className="text-sm sm:text-md">
      {notifications?.content && notifications.content.length > 0 ? (
        notifications.content.map((content, index) => (
          <Fragment key={content?.notification?.id}>
            <div
              className={`cursor-pointer p-2 transition-all duration-200 ${
                content.isRead ? 'opacity-50' : ''
              } hover:bg-background-secondary`}
              onClick={() => {
                // Handle the notification read state change
                if (!content.isRead) {
                  const notIndex = notifications.content.findIndex(
                    (item) => item.notification.id === content.notification.id
                  )
                  if (notIndex !== -1) {
                    const newNotifications = [...notifications.content]
                    newNotifications[notIndex] = {
                      ...newNotifications[notIndex],
                      isRead: true,
                    }
                    setNotifications({
                      ...notifications,
                      content: newNotifications,
                    })
                    if (!content.isRead) {
                      readNotification(content.notification.id)
                    }
                  }
                }
              }}
            >
              <div className="flex items-center">
                <GoDotFill
                  className={`text-2xl mr-2 shrink-0 ${content.isRead ? 'text-gray-500' : 'text-white'}`}
                />
                <div className="flex-1 p-1 max-line--height break-words">
                  {content.notification?.message}
                </div>
                <span className="text-sm text-gray-500">
                  {humanatizeNotificationDate(content)?.notification?.createdAt}{' '}
                  ago
                </span>
              </div>
            </div>

            {index < notifications.content.length - 1 && (
              <hr className="my-2 border-t border-border" />
            )}
          </Fragment>
        ))
      ) : (
        <div className="p-2 text-center">
          Nothing to show{' '}
          <span role="img" aria-label="emoji-sad">
            😒
          </span>
        </div>
      )}
    </div>
  )
}
