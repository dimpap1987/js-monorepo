import styles from './notification.module.css'
import Notification, { DpNotificationProps } from './notification'

interface DpNotificationListProps {
  notifications: DpNotificationProps[]
}

export default function DpNotificationList({
  notifications,
}: DpNotificationListProps) {
  return (
    notifications &&
    notifications.length > 0 && (
      <section>
        <div className="fixed right-2 p-2 z-50 flex flex-col-reverse gap-2">
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
