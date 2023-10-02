import styles from './notification.module.css'
import { FaRegTimesCircle } from 'react-icons/fa'
import { BsCheck2Circle } from 'react-icons/bs'

export type Notification = {
  id?: string | number
  type: 'success' | 'error' | 'spinner'
  message: string
  description?: string
}

export interface NotificationProps {
  notificationList: Notification[]
}

export function Notifications({ notificationList }: NotificationProps) {
  return (
    <section>
      {notificationList?.length > 0 && (
        <div className="overflow-hidden fixed right-2 p-2 pl-5 z-50">
          {notificationList.map((notification, index) => (
            <div
              key={index}
              className={`${styles.notificationContainer} bg-gray-800 my-1.5 p-2 border-purple-500 border-2 rounded-md text-sm text-white`}
            >
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
                    <BsCheck2Circle className="text-green-600 text-3xl" />
                  </div>
                )}

                {/* Type = 'Error' */}
                {notification.type === 'error' && (
                  <div className={`${styles.spinnerGrid} self-center p-1`}>
                    <FaRegTimesCircle className="text-red-600 text-3xl" />
                  </div>
                )}

                {/* Message */}
                {notification.message && (
                  <div
                    className={`${styles.gridItem1} overflow-hidden text-ellipsis self-center`}
                  >
                    <strong className="block p-0.5">
                      {notification.message}
                    </strong>
                  </div>
                )}

                {/* Description */}
                {notification.description && (
                  <div
                    className={`${styles.gridItem2} overflow-hidden text-ellipsis self-center`}
                  >
                    <small className="block p-0.5">
                      {notification.description}
                    </small>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default Notifications
