'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import { DpButton } from '@js-monorepo/button'
import { ScrollArea } from '@js-monorepo/components/scroll'
import { usePaginationWithParams } from '@js-monorepo/next/hooks/pagination'
import {
  humanatizeNotificationDate,
  NoticationItemContext,
  NotificationReadAllButton,
  updateNotificationAsRead,
  useNotificationWebSocket,
} from '@js-monorepo/notification-bell'
import { PaginationType, UserNotificationType } from '@js-monorepo/types'
import { cn } from '@js-monorepo/ui/util'
import { useNotificationStore } from '@next-app/state'
import {
  apiFetchUserNotifications,
  apiReadAllNotifications,
  apiReadNotification,
} from '@next-app/utils/notifications'
import { websocketOptions } from '@next-app/utils/websocket.config'
import { Fragment, useEffect, useRef, useState } from 'react'
import { GoDotFill } from 'react-icons/go'
import {
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight,
  MdOutlineNavigateBefore,
  MdOutlineNavigateNext,
} from 'react-icons/md'

export function NotificationList({ className }: { className?: string }) {
  const { user } = useSession()
  const [notifications, setNotifications] = useState<
    Partial<PaginationType<UserNotificationType>> | undefined
  >()
  const { searchQuery, setPagination, pagination } = usePaginationWithParams(
    1,
    15
  )

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

  useNotificationWebSocket(
    websocketOptions,
    (notification: UserNotificationType) => {
      if (notification && pagination.pageIndex === 1) {
        setNotifications((prev) => ({
          ...prev,
          content: [notification, ...(prev?.content ?? [])],
        }))
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
      setNotifications((prev) => ({
        ...prev,
        content: prev?.content?.map((content) => ({
          ...content,
          isRead: true,
        })),
      }))
    }
  }, [notificationCount])

  return (
    <div
      className={cn(
        'text-sm sm:text-base select-none p-1 py-2 rounded-md sm:p-3 bg-background-secondary text-white',
        'flex flex-col h-full',
        className
      )}
    >
      <div className="flex justify-between mb-3">
        <BackArrowWithLabel className="flex-1" arrowClassName="sm:hidden">
          <h1 className="text-base sm:text-lg px-2 ml-5 sm:ml-0 text-center sm:text-left">
            Notifications
          </h1>
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
      <section className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {loadingRef.current === false ? (
            notifications?.content && notifications.content.length > 0 ? (
              notifications.content.map((content, index) => (
                <Fragment key={content?.notification?.id}>
                  <div
                    className={`cursor-pointer py-2 px-1 rounded transition-all duration-200 ${content.isRead ? 'opacity-50' : ''} hover:opacity-90 hover:bg-primary/20`}
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
                        <NoticationItemContext
                          message={content.notification.message}
                        ></NoticationItemContext>
                      </div>
                      <div className="flex px-2 flex-col sm:gap-1 gap-0 items-end sm:flex-row text-[10px] md:text-sm text-gray-500">
                        <span>
                          {humanatizeNotificationDate(
                            content?.notification?.createdAt || ''
                          )}
                        </span>
                        <span>ago</span>
                      </div>
                    </div>
                  </div>

                  {index < (notifications?.content?.length || 0) - 1 && (
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
            )
          ) : (
            <></>
          )}
        </ScrollArea>
      </section>

      {/* Pagination // TODO create component */}
      {notifications &&
        notifications.totalPages &&
        notifications.totalPages >= pagination.pageIndex &&
        notifications.totalPages !== 1 && (
          <div className="flex justify-around p-2 pb-0 gap-2 border-t border-border">
            <div className="flex gap-2">
              <DpButton
                variant="primary"
                onClick={() =>
                  setPagination((prev) => ({
                    pageSize: prev.pageSize,
                    pageIndex: 1,
                  }))
                }
                disabled={pagination.pageIndex === 1}
                className={`px-2 py-1 rounded ${pagination.pageIndex === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <MdOutlineKeyboardDoubleArrowLeft />
              </DpButton>

              <DpButton
                variant="primary"
                onClick={() =>
                  setPagination((prev) => ({
                    pageSize: prev.pageSize,
                    pageIndex: Math.max(prev.pageIndex - 1, 0),
                  }))
                }
                disabled={pagination.pageIndex === 1}
                className={`px-2 py-1 rounded ${pagination.pageIndex === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <MdOutlineNavigateBefore />
              </DpButton>
            </div>

            <span className="text-xs sm:text-md font-semibold self-center">
              Page {pagination.pageIndex || 1} of {notifications.totalPages}
            </span>

            <div className="flex gap-2">
              <DpButton
                variant="primary"
                onClick={() =>
                  setPagination((prev) => ({
                    pageSize: prev.pageSize,
                    pageIndex: Math.min(
                      prev.pageIndex + 1,
                      notifications.totalPages || 1
                    ),
                  }))
                }
                disabled={pagination.pageIndex === notifications.totalPages}
                className={`px-2 py-1 rounded ${pagination.pageIndex === notifications.totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <MdOutlineNavigateNext />
              </DpButton>
              <DpButton
                variant="primary"
                onClick={() =>
                  setPagination((prev) => ({
                    pageSize: prev.pageSize,
                    pageIndex: notifications.totalPages || 1,
                  }))
                }
                disabled={pagination.pageIndex === notifications.totalPages}
                className={`px-2 py-1 rounded ${pagination.pageIndex === notifications.totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <MdOutlineKeyboardDoubleArrowRight />
              </DpButton>
            </div>
          </div>
        )}
    </div>
  )
}
