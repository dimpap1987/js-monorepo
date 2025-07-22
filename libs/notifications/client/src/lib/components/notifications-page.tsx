'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import { ScrollArea } from '@js-monorepo/components/scroll'
import { usePaginationWithParams } from '@js-monorepo/next/hooks/pagination'
import { WebSocketOptionsType } from '@js-monorepo/next/providers'
import { PaginationComponent } from '@js-monorepo/pagination'
import { PaginationType, UserNotificationType } from '@js-monorepo/types'
import { cn } from '@js-monorepo/ui/util'
import { Fragment, useEffect, useRef, useState } from 'react'
import { GoDotFill } from 'react-icons/go'
import { useNotificationWebSocket } from '../hooks/index'
import { useNotificationStore } from '../state'
import {
  apiFetchUserNotifications,
  apiReadAllNotifications,
  apiReadNotification,
  humanatizeNotificationDate,
  updateNotificationAsRead,
} from '../utils/notifications'
import { NotificationReadAllButton } from './bell/notification-read-all'

export function NotificationsPage({
  className,
  websocketOptions,
}: {
  className?: string
  websocketOptions: WebSocketOptionsType
}) {
  const { session } = useSession()
  const user = session?.user
  const [notifications, setNotifications] = useState<Partial<PaginationType<UserNotificationType>> | undefined>()
  const { searchQuery, setPagination, pagination } = usePaginationWithParams(1, 15)

  const loadingRef = useRef(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return

      try {
        loadingRef.current = true
        const response = await apiFetchUserNotifications(user.id, searchQuery)
        if (response.ok) {
          setNotifications(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      } finally {
        loadingRef.current = false
      }
    }

    fetchNotifications()
  }, [user, searchQuery])

  useNotificationWebSocket(websocketOptions, (notification: UserNotificationType) => {
    if (notification && pagination.page === 1) {
      setNotifications((prev) => ({
        ...prev,
        content: [notification, ...(prev?.content ?? [])],
      }))
    }
  })

  const { markNotificationAsRead, latestReadNotificationId, setNotificationCount, notificationCount } =
    useNotificationStore()

  useEffect(() => {
    if (latestReadNotificationId) {
      setNotifications((prev) => {
        if (!prev || !prev.content) return prev

        return {
          ...prev,
          content: updateNotificationAsRead(prev.content, latestReadNotificationId),
        }
      })
    }
  }, [latestReadNotificationId])

  useEffect(() => {
    if (notificationCount === 0) {
      setNotifications((prev) => ({
        ...prev,
        content: prev?.content?.map((content) => ({
          ...content,
          isRead: true,
        })),
      }))
    }
  }, [notificationCount])

  const hasPagination: boolean =
    notifications !== undefined &&
    notifications.totalPages !== undefined &&
    notifications.totalPages > 1 &&
    notifications.totalPages >= pagination?.page

  return (
    <div className={cn('text-sm sm:text-base select-none sm:p-3', 'flex flex-col h-full', className)}>
      <div className="flex justify-between items-center">
        <BackArrowWithLabel className="flex-1" arrowClassName="sm:hidden">
          <h2 className="px-2 ml-5 sm:ml-0 text-center sm:text-left">Notifications</h2>
        </BackArrowWithLabel>

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

      {/* Render Notifications */}
      <section className="flex-1 overflow-hidden text-white bg-background-secondary rounded-md p-1 py-2">
        {loadingRef.current === false ? (
          notifications?.content && notifications.content.length > 0 ? (
            <ScrollArea className="h-full">
              {notifications.content.map((content, index) => (
                <Fragment key={content?.notification?.id}>
                  <div
                    className={`cursor-pointer p-1 sm:py-2 rounded transition-all duration-200 ${content.isRead ? 'opacity-50' : ''} hover:opacity-90 hover:bg-primary/20`}
                    onClick={async () => {
                      if (!content.isRead && notifications?.content) {
                        await apiReadNotification(content.notification.id)

                        setNotifications({
                          ...notifications,
                          content: updateNotificationAsRead(notifications?.content, content.notification.id),
                        })
                        markNotificationAsRead(content.notification.id)
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <GoDotFill
                        className={`text-sm mr-1 shrink-0 ${content.isRead ? 'text-gray-500' : 'text-white'}`}
                      />
                      <div
                        className="flex-1 p-1 max-line--height break-all overflow-hidden text-ellipsis whitespace-normal select-text text-gray-300"
                        dangerouslySetInnerHTML={{
                          __html: content.notification?.message,
                        }}
                      ></div>
                      <div className="flex px-2 flex-col sm:gap-1 gap-0 items-end sm:flex-row text-[10px] md:text-sm text-gray-500">
                        <span>{humanatizeNotificationDate(content?.notification?.createdAt || '')}</span>
                      </div>
                    </div>
                  </div>

                  {index < (notifications?.content?.length || 0) - 1 && <hr className="my-2 border-t border-border" />}
                </Fragment>
              ))}
            </ScrollArea>
          ) : (
            <div className="p-2 text-center h-full flex justify-center items-center font-semibold">
              Nothing to show{' '}
              <span role="img" aria-label="emoji-sad">
                😒
              </span>
            </div>
          )
        ) : (
          <></>
        )}
      </section>

      {hasPagination && (
        <PaginationComponent
          pagination={pagination}
          totalPages={notifications?.totalPages as number}
          onChange={setPagination}
        ></PaginationComponent>
      )}
    </div>
  )
}
