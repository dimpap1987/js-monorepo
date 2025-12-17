'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import { ScrollArea } from '@js-monorepo/components/scroll'
import { usePaginationWithParams } from '@js-monorepo/next/hooks/pagination'
import { PaginationComponent } from '@js-monorepo/pagination'
import { UserNotificationType } from '@js-monorepo/types'
import { cn } from '@js-monorepo/ui/util'
import { useQueryClient } from '@tanstack/react-query'
import { Fragment, useEffect } from 'react'
import { GoDotFill } from 'react-icons/go'
import { useNotificationWebSocket } from '../hooks/index'
import { useReadAllNotifications, useReadNotification, useUserNotifications } from '../queries/notifications-queries'
import { humanatizeNotificationDate } from '../utils/notifications'
import { queryKeys } from '@js-monorepo/utils/http/queries'
import { NotificationReadAllButton } from './bell/notification-read-all'

export function NotificationsPage() {
  const {
    session: { user },
  } = useSession()

  const { searchQuery, setPagination, pagination } = usePaginationWithParams(1, 15)
  const queryClient = useQueryClient()

  const { data: notifications, isLoading } = useUserNotifications(user?.id, searchQuery)
  const readNotificationMutation = useReadNotification()
  const readAllNotificationsMutation = useReadAllNotifications()

  // Handle WebSocket notifications - update query cache
  useNotificationWebSocket((notification: UserNotificationType) => {
    if (notification && pagination.page === 1 && user?.id) {
      queryClient.setQueryData(queryKeys.notifications.user(user.id, searchQuery), (oldData: typeof notifications) => {
        if (!oldData?.content) return oldData
        return {
          ...oldData,
          content: [notification, ...oldData.content],
        }
      })
    }
  })

  const hasPagination: boolean =
    notifications !== undefined &&
    notifications.totalPages !== undefined &&
    notifications.totalPages > 1 &&
    notifications.totalPages >= pagination?.page

  return (
    <div className={cn('text-sm sm:text-base select-none sm:p-3', 'flex flex-col h-full')}>
      <div className="flex justify-between items-center">
        <BackArrowWithLabel className="flex-1" arrowClassName="sm:hidden">
          <h2 className="px-2 ml-5 sm:ml-0 text-center sm:text-left">Notifications</h2>
        </BackArrowWithLabel>

        <NotificationReadAllButton
          onReadAll={async () => {
            if (notifications?.content?.some((content) => !content.isRead)) {
              await readAllNotificationsMutation.mutateAsync()
            }
          }}
        ></NotificationReadAllButton>
      </div>

      {/* Render Notifications */}
      <section className="flex-1 overflow-hidden text-white bg-background-secondary rounded-md p-1 py-2">
        {!isLoading ? (
          notifications?.content && notifications.content.length > 0 ? (
            <ScrollArea className="h-full">
              {notifications.content.map((content, index) => (
                <Fragment key={content?.notification?.id}>
                  <div
                    className={`cursor-pointer p-1 sm:py-2 rounded transition-all duration-200 ${content.isRead ? 'opacity-50' : ''} hover:opacity-90 hover:bg-primary/20`}
                    onClick={async () => {
                      if (!content.isRead && notifications?.content) {
                        await readNotificationMutation.mutateAsync(content.notification.id)
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
