// Main components - primary entry points
export { NotificationsPage } from './lib/components/notifications-page'
export { NotificationBellContainerScroll } from './lib/components/bell/notification-bell-container'

// Reusable building blocks
export { NotificationBellButton } from './lib/components/bell/notification-bell-trigger'
export { NotificationReadAllButton } from './lib/components/bell/notification-read-all'
export { NotificationListVirtual } from './lib/components/notification-list-virtual'
export type { NotificationListVirtualProps } from './lib/components/notification-list-virtual'
export { NotificationItem } from './lib/components/notification-item'
export { NotificationEmptyState } from './lib/components/notification-empty-state'

// Hooks
export { useNotificationWebSocket, useNotificationCursor } from './lib/hooks'

// Queries (TanStack Query hooks)
export {
  useUserNotificationsByCursor,
  useUserNotifications,
  useReadNotification,
  useReadAllNotifications,
} from './lib/queries/notifications-queries'

// Utilities
export {
  apiFetchUserNotifications,
  apiReadNotification,
  apiReadAllNotifications,
  humanatizeNotificationDate,
  updateNotificationAsRead,
} from './lib/utils/notifications'
