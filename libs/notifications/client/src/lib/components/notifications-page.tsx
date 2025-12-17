'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import { ScrollArea } from '@js-monorepo/components/scroll'
import { usePaginationWithParams } from '@js-monorepo/next/hooks/pagination'
import { PaginationComponent } from '@js-monorepo/pagination'
import { UserNotificationType } from '@js-monorepo/types'
import { cn } from '@js-monorepo/ui/util'
import { useQueryClient } from '@tanstack/react-query'
import { GoDotFill } from 'react-icons/go'
import { useNotificationWebSocket } from '../hooks/index'
import { useReadAllNotifications, useReadNotification, useUserNotifications } from '../queries/notifications-queries'
import { humanatizeNotificationDate } from '../utils/notifications'
import { queryKeys } from '@js-monorepo/utils/http/queries'
import { NotificationReadAllButton } from './bell/notification-read-all'

export function NotificationsPage() {
  const { session } = useSession()
  const user = session?.user

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

  const hasPagination = (notifications?.totalPages ?? 0) > 1

  return (
    <div className={cn('text-sm sm:text-base select-none sm:p-3', 'flex flex-col h-full')}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <BackArrowWithLabel className="flex-1" arrowClassName="sm:hidden">
          <h2 className="px-2 ml-5 sm:ml-0 text-center sm:text-left text-xl sm:text-2xl font-semibold tracking-tight">
            Notifications
          </h2>
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
      <section className="flex-1 overflow-hidden bg-card border border-border rounded-lg shadow-sm">
        {!isLoading ? (
          notifications?.content && notifications.content.length > 0 ? (
            <ScrollArea className="h-full">
              <div className="p-2 sm:p-4 space-y-2">
                {notifications.content.map((content) => {
                  const isUnread = !content.isRead
                  return (
                    <div
                      key={content?.notification?.id}
                      className={cn(
                        'group relative cursor-pointer rounded-lg p-3 sm:p-4 transition-all duration-200',
                        'border border-border-glass hover:border-border',
                        'hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5',
                        'active:scale-[0.99]',
                        isUnread
                          ? 'bg-primary/5 border-l-4 border-l-primary hover:bg-primary/10 hover:border-l-primary/80'
                          : 'bg-card/50 opacity-75 hover:opacity-100 hover:bg-card'
                      )}
                      onClick={async () => {
                        if (!content.isRead && notifications?.content) {
                          await readNotificationMutation.mutateAsync(content.notification.id)
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Unread indicator */}
                        <div className="flex-shrink-0 pt-1">
                          {isUnread ? (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm shadow-primary/50 animate-pulse" />
                          ) : (
                            <GoDotFill className="text-xs text-foreground-muted" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div
                            className={cn(
                              'text-sm sm:text-base break-words select-text leading-relaxed',
                              'overflow-wrap-anywhere word-break break-word',
                              isUnread ? 'text-foreground font-semibold' : 'text-foreground-muted font-normal'
                            )}
                            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                            dangerouslySetInnerHTML={{
                              __html: content.notification?.message,
                            }}
                          />
                          <div className="mt-2 flex items-center justify-end">
                            <span
                              className={cn(
                                'text-xs sm:text-sm whitespace-nowrap',
                                isUnread ? 'text-foreground-muted' : 'text-foreground-neutral'
                              )}
                            >
                              {humanatizeNotificationDate(content?.notification?.createdAt || '')} ago
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="h-full flex flex-col justify-center items-center p-8 text-center">
              <span role="img" aria-label="bell notification" className="text-4xl mb-3 block">
                🔔
              </span>
              <p className="text-lg font-semibold text-foreground mb-1">No notifications yet</p>
              <p className="text-sm text-foreground-muted">You're all caught up!</p>
            </div>
          )
        ) : (
          <div className="h-full flex justify-center items-center p-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-foreground-muted">Loading notifications...</p>
            </div>
          </div>
        )}
      </section>

      {/* Pagination */}
      {hasPagination && (
        <div className="mt-4 sm:mt-6">
          <PaginationComponent
            pagination={pagination}
            totalPages={notifications?.totalPages as number}
            onChange={setPagination}
          ></PaginationComponent>
        </div>
      )}
    </div>
  )
}
