import { cn } from '@js-monorepo/utils'
import Notification, { DpNotificationProps } from './notification'
import styles from './notification.module.css'

interface DpNotificationListProps {
  notifications: DpNotificationProps[]
  readonly overlayClassName?: string
}

export default function DpNotificationList({
  notifications,
  overlayClassName,
}: DpNotificationListProps) {
  return (
    notifications &&
    notifications.length > 0 && (
      <section
        className={cn(
          `fixed top-[50px] right-2 p-2 z-40 flex flex-col-reverse gap-2`,
          overlayClassName
        )}
      >
        {notifications.map((notification, index) => (
          <div
            key={notification.id || index}
            className={`${styles.notificationContainer} flex bg-background-secondary p-2 border-purple-500 border-2 rounded-md text-sm text-white`}
          >
            <Notification {...notification} />
          </div>
        ))}
      </section>
    )
  )
}
