import styles from './notification.module.css'
import Notification, { DpNotificationProps } from './notification'
import { twMerge } from 'tailwind-merge'

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
      <section>
        <div
          className={twMerge(
            `fixed right-2 p-2 z-40 flex flex-col-reverse gap-2`,
            overlayClassName
          )}
        >
          {notifications.map((notification, index) => (
            <div
              key={notification.id || index}
              className={`${styles.notificationContainer} flex bg-foreground p-2 border-purple-500 border-2 rounded-md text-sm text-white`}
            >
              <Notification {...notification} />
            </div>
          ))}
        </div>
      </section>
    )
  )
}
