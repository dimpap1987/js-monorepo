import styles from './notification.module.css'
import { FaRegTimesCircle } from 'react-icons/fa'
import { BsCheck2Circle } from 'react-icons/bs'

export type NotificationType = {
  id?: number
  type: 'success' | 'error' | 'spinner'
  message: string
  description?: string
  duration?: number
}

export type NotificationProps = {
  notification: NotificationType
}

export default function Notification({ notification }: NotificationProps) {
  return (
    <div className={styles.containerGrid}>
      {/* Type = 'Spinner' */}
      {notification.type === 'spinner' && (
        <div className={`${styles.spinnerGrid} self-center p-1`}>
          <span className={styles.spinner}></span>
        </div>
      )}

      {/* Type = 'Success' */}
      {notification.type === 'success' && (
        <div className={`${styles.spinnerGrid} self-center p-1`}>
          <BsCheck2Circle className="text-green-600 text-2xl" />
        </div>
      )}

      {/* Type = 'Error' */}
      {notification.type === 'error' && (
        <div className={`${styles.spinnerGrid} self-center p-1`}>
          <FaRegTimesCircle className="text-red-600 text-2xl" />
        </div>
      )}

      {/* Message */}
      {notification.message && (
        <div
          className={`${styles.gridItem1} overflow-hidden text-ellipsis self-center`}
        >
          <strong className="block p-0.5">{notification.message}</strong>
        </div>
      )}

      {/* Description */}
      {notification.description && (
        <div
          className={`${styles.gridItem2} overflow-hidden text-ellipsis self-center`}
        >
          <small className="block p-0.5">{notification.description}</small>
        </div>
      )}
    </div>
  )
}
