'use client'

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react'
import { NotificationType } from './notification'
import NotificationList from './notificationList'

// types
type NotificationProviderPros = {
  children?: ReactNode
}

// create context
const NotificationsContext = createContext<
  | {
      notifications: NotificationType[]
      setNotifications: React.Dispatch<React.SetStateAction<NotificationType[]>>
      addNotification: (notification: NotificationType) => void
    }
  | undefined
>(undefined)

// useNotifications hook
export const useNotifications = (): [
  NotificationType[],
  React.Dispatch<React.SetStateAction<NotificationType[]>>,
  (notification: NotificationType) => void,
] => {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    )
  }
  return [
    context.notifications,
    context.setNotifications,
    context.addNotification,
  ]
}

// NotificationProvider
export const NotificationComponent: React.FC<NotificationProviderPros> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([])

  //useCallback hook which will ensure that the addNotification function itself is memoized and not recreated on every render
  const addNotification = useCallback((notification: NotificationType) => {
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

      const timeoutId = setTimeout(
        () => {
          setNotifications((prev) =>
            prev.filter((p) => p.id !== notification.id)
          )
        },
        notification?.duration ?? 3000
      )

      timeoutsRef.current[notification.id] = timeoutId
    })
  }, [notifications])

  const contextValue = useMemo(() => {
    return {
      notifications,
      setNotifications,
      addNotification,
    }
  }, [notifications, setNotifications, addNotification])

  return (
    <NotificationsContext.Provider value={contextValue}>
      <NotificationList notifications={notifications} />
      {children}
    </NotificationsContext.Provider>
  )
}

export default NotificationComponent
