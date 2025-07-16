import { cn } from '@js-monorepo/ui/util'
import { DpNotificationProps, NotificationItem } from './notification'

interface DpNotificationListProps {
  notifications: DpNotificationProps[]
  readonly className?: string
}

export default function DpNotificationList({ notifications, className }: DpNotificationListProps) {
  return (
    notifications?.length > 0 && (
      <section className={cn(`fixed top-navbar-offset right-0 z-30 flex flex-col-reverse gap-2 w-0`, className)}>
        {notifications.map((notification, index) => (
          <NotificationItem
            key={notification.id || index}
            message={notification.message}
            type={notification.type}
            description={notification.description}
          />
        ))}
      </section>
    )
  )
}
