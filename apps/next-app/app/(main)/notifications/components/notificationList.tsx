'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { useLoader } from '@js-monorepo/loader'
import { usePaginationWithParams } from '@js-monorepo/next/hooks/pagination'
import {
  humanatizeNotificationDate,
  NotificationReadAllButton,
  updateNotificationAsRead,
  useNotificationWebSocket,
} from '@js-monorepo/notification-bell'
import { PaginationType, UserNotificationType } from '@js-monorepo/types'
import { wait } from '@js-monorepo/utils/common'
import { useNotificationStore } from '@next-app/state'
import {
  apiFetchUserNotifications,
  apiReadAllNotifications,
  apiReadNotification,
} from '@next-app/utils/notifications'
import { websocketOptions } from '@next-app/utils/websocket.config'
import { Fragment, useEffect, useRef, useState } from 'react'
import { GoDotFill } from 'react-icons/go'

export function NotificationList() {
  const { user } = useSession()
  const [notifications, setNotifications] = useState<
    Partial<PaginationType<UserNotificationType>> | undefined
  >()
  const { setLoaderState } = useLoader()
  const { searchQuery } = usePaginationWithParams(1, 50)

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
        const response = await apiFetchUserNotifications(user.id, searchQuery)
        if (response.ok) {
          setNotifications(response.data)
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
  }, [user?.id, searchQuery])

  useNotificationWebSocket(
    websocketOptions,
    (notification: UserNotificationType) => {
      if (notification) {
        setNotifications((prev) => {
          return {
            ...prev,
            content: [notification, ...(prev?.content ?? [])],
          }
        })
      }
    }
  )
  const {
    markNotificationAsRead,
    latestReadNotificationId,
    setNotificationCount,
    notificationCount,
  } = useNotificationStore()

  useEffect(() => {
    if (latestReadNotificationId) {
      setNotifications((prev) => {
        if (!prev || !prev.content) return prev

        return {
          ...prev,
          content: updateNotificationAsRead(
            prev.content,
            latestReadNotificationId
          ),
        }
      })
    }
  }, [latestReadNotificationId])

  useEffect(() => {
    if (notificationCount === 0) {
      setNotifications((prev) => {
        return {
          ...prev,
          content: prev?.content?.map((content) => ({
            ...content,
            isRead: true,
          })),
        }
      })
    }
  }, [notificationCount])

  if (loadingRef.current) return null

  return (
    <div className="text-sm sm:text-base select-none p-1 sm:p-3">
      <div className="flex justify-between mb-3">
        <h1 className="text-base sm:text-lg">Notifications</h1>
        <NotificationReadAllButton
          onReadAll={async () => {
            if (notifications?.content?.some((content) => !content.isRead)) {
              const response = await apiReadAllNotifications()
              if (response.ok) {
                setNotifications({
                  ...notifications,
                  content: notifications?.content?.map((content) => ({
                    ...content,
                    isRead: true,
                  })),
                })
                setNotificationCount(0)
              }
            }
          }}
        ></NotificationReadAllButton>
      </div>
      {notifications?.content && notifications.content.length > 0 ? (
        notifications.content.map((content, index) => (
          <Fragment key={content?.notification?.id}>
            <div
              className={`cursor-pointer py-2 px-1 rounded transition-all duration-200 ${
                content.isRead ? 'opacity-50' : ''
              } hover:opacity-90 hover:bg-primary/20`}
              onClick={async () => {
                // Handle the notification read state change
                if (!content.isRead && notifications?.content) {
                  await apiReadNotification(content.notification.id)

                  setNotifications({
                    ...notifications,
                    content: updateNotificationAsRead(
                      notifications?.content,
                      content.notification.id
                    ),
                  })
                  markNotificationAsRead(content.notification.id)
                }
              }}
            >
              <div className="flex items-center">
                <GoDotFill
                  className={`text-sm mr-1 shrink-0 ${content.isRead ? 'text-gray-500' : 'text-foreground'}`}
                />
                <div className="flex-1 p-1 max-line--height break-all overflow-hidden text-ellipsis whitespace-normal select-text">
                  {content.notification?.message}
                </div>
                <div className="flex flex-col sm:gap-1 gap-0 items-end sm:flex-row text-[10px] md:text-sm text-gray-500">
                  <span>
                    {humanatizeNotificationDate(
                      content?.notification?.createdAt || ''
                    )}
                  </span>
                  <span>ago</span>
                </div>
              </div>
            </div>

            {notifications?.content?.length &&
              index < notifications.content.length - 1 && (
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
