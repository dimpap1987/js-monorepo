import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { DpNotificationProps } from './notification'
import DpNotificationList from './notificationList'

// create context
const NotificationsContext = createContext<
  | {
      addNotification: (notification: DpNotificationProps) => void
      notifications: DpNotificationProps[]
      setNotifications: React.Dispatch<
        React.SetStateAction<DpNotificationProps[]>
      >
    }
  | undefined
>(undefined)

// useNotifications hook
export const useNotifications = (): [
  (notification: DpNotificationProps) => void,
  DpNotificationProps[],
  React.Dispatch<React.SetStateAction<DpNotificationProps[]>>,
] => {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    )
  }
  return [
    context.addNotification,
    context.notifications,
    context.setNotifications,
  ]
}

// NotificationProvider
export const DpNotificationProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<DpNotificationProps[]>([])

  //useCallback hook which will ensure that the addNotification function itself is memoized and not recreated on every render
  const addNotification = useCallback((notification: DpNotificationProps) => {
    const { id = Math.floor(Math.random() * 1000000) } = notification
    setNotifications((prev) => [...prev, { ...notification, id }])
  }, [])

  const timeoutsRef = useRef<Record<number | string, NodeJS.Timeout>>({})

  useEffect(() => {
    const currentNotificationsIds = notifications.map((n) => n.id)

    // For any timeouts not in the current notifications, clear them
    Object.keys(timeoutsRef.current).forEach((id) => {
      if (!currentNotificationsIds.includes(Number(id))) {
        clearTimeout(timeoutsRef.current[id])
        delete timeoutsRef.current[id]
      }
    })

    notifications.forEach((notification) => {
      // If we already have a timeout for this notification, skip setting another
      if (!notification.id || timeoutsRef.current[notification.id]) return

      const timeoutId = setTimeout(() => {
        setNotifications((prev) => prev.filter((p) => p.id !== notification.id))
      }, notification?.duration ?? 3000)

      timeoutsRef.current[notification.id] = timeoutId
    })
  }, [notifications])

  const contextValue = useMemo(() => {
    return {
      addNotification,
      notifications,
      setNotifications,
    }
  }, [notifications, setNotifications, addNotification])

  return (
    <NotificationsContext.Provider value={contextValue}>
      <DpNotificationList notifications={notifications} />
      {children}
    </NotificationsContext.Provider>
  )
}

export default DpNotificationProvider
