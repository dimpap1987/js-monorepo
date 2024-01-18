import styles from './notification.module.css'
import { FaRegTimesCircle } from 'react-icons/fa'
import { BsCheck2Circle } from 'react-icons/bs'

export type DpNotificationProps = {
  readonly id?: number
  readonly type?: 'success' | 'error' | 'spinner'
  readonly message: string
  readonly description?: string
  readonly duration?: number
}

export default function DpNotification({
  type = 'success',
  message,
  description,
}: DpNotificationProps) {
  return (
    <div className={styles.containerGrid}>
      {/* Type = 'Spinner' */}
      {type === 'spinner' && (
        <div className={`${styles.spinnerGrid} self-center p-1`}>
          <span className={styles.spinner}></span>
        </div>
      )}

      {/* Type = 'Success' */}
      {type === 'success' && (
        <div className={`${styles.spinnerGrid} self-center p-1`}>
          <BsCheck2Circle className="text-green-600 text-2xl" />
        </div>
      )}

      {/* Type = 'Error' */}
      {type === 'error' && (
        <div className={`${styles.spinnerGrid} self-center p-1`}>
          <FaRegTimesCircle className="text-red-600 text-2xl" />
        </div>
      )}

      {/* Message */}
      {message && (
        <div
          className={`${styles.gridItem1} overflow-hidden text-ellipsis self-center`}
        >
          <strong className="block p-0.5">{message}</strong>
        </div>
      )}

      {/* Description */}
      {description && (
        <div
          className={`${styles.gridItem2} overflow-hidden text-ellipsis self-center`}
        >
          <small className="block p-0.5">{description}</small>
        </div>
      )}
    </div>
  )
}
