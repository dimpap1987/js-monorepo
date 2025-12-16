'use client'

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
      addNotification: (notification: DpNotificationProps) => number
      notifications: DpNotificationProps[]
      setNotifications: React.Dispatch<React.SetStateAction<DpNotificationProps[]>>
      removeNotification: (notificationId?: number) => void
    }
  | undefined
>(undefined)

// useNotifications hook
export const useNotifications = (): {
  addNotification: (notification: DpNotificationProps) => number
  notifications: DpNotificationProps[]
  setNotifications: React.Dispatch<React.SetStateAction<DpNotificationProps[]>>
  removeNotification: (notificationId?: number) => void
} => {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return {
    addNotification: context.addNotification,
    notifications: context.notifications,
    setNotifications: context.setNotifications,
    removeNotification: context.removeNotification,
  }
}

// NotificationProvider
export const DpNotificationProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [notifications, setNotifications] = useState<DpNotificationProps[]>([])

  //useCallback hook which will ensure that the addNotification function itself is memoized and not recreated on every render
  const addNotification = useCallback((notification: DpNotificationProps) => {
    const { id = Math.floor(Math.random() * 1000000) } = notification
    setNotifications((prev) => [...prev, { ...notification, id }])
    return id
  }, [])

  const removeNotification = useCallback((notificationId?: number) => {
    if (notificationId === undefined) return
    setNotifications((prev) => prev.filter((not) => not.id !== notificationId))
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

      // Only set timeout if notification is closable (defaults to true)
      const isClosable = notification.closable !== false
      if (!isClosable && !notification.duration) return

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
      removeNotification,
    }
  }, [notifications, setNotifications, addNotification, removeNotification])

  return (
    <NotificationsContext.Provider value={contextValue}>
      <DpNotificationList notifications={notifications} onRemove={removeNotification} />
      {children}
    </NotificationsContext.Provider>
  )
}

export default DpNotificationProvider
