import { cn } from '@js-monorepo/ui/util'
import { DpNotificationProps, NotificationItem } from './notification'

interface DpNotificationListProps {
  notifications: DpNotificationProps[]
  readonly className?: string
  readonly onRemove: (id?: number) => void
}

export default function DpNotificationList({ notifications, className, onRemove }: DpNotificationListProps) {
  return (
    notifications?.length > 0 && (
      <section
        className={cn(
          `fixed top-navbar-offset right-2 p-2 z-[55] flex flex-col-reverse gap-2 w-0 pointer-events-none`,
          className
        )}
      >
        {notifications.map((notification, index) => (
          <NotificationItem
            key={notification.id || index}
            message={notification.message}
            type={notification.type}
            description={notification.description}
            closable={notification.closable}
            id={notification.id}
            onClose={onRemove ? (id) => onRemove(id) : undefined}
          />
        ))}
      </section>
    )
  )
}
