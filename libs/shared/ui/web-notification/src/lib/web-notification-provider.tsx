'use client'

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  registerServiceWorker,
  requestPushPermission,
  subscribeNotifactionToServer,
} from './utils'
import { useSession } from '@js-monorepo/auth/next/client'

interface WebNotificationContextType {
  permission: NotificationPermission
  createNotification: (title: string, options: NotificationOptions) => void
  requestPermission: () => void
}

const WebNotificationContext = createContext<
  WebNotificationContextType | undefined
>(undefined)

const WebNotificationProvider = ({ children }: { children: ReactNode }) => {
  const [permission, setPermission] = useState<NotificationPermission>(
    Notification.permission
  )

  const { user } = useSession()

  useEffect(() => {
    registerServiceWorker().then(() => {
      if (Notification.permission === 'granted' && user?.id) {
        subscribeNotifactionToServer(user?.id)
      }
    })
  }, [])

  const requestPermission = useCallback(() => {
    requestPushPermission().then(async (perm) => {
      setPermission(perm)
      if (perm === 'granted' && user?.id) {
        subscribeNotifactionToServer(user?.id)
      }
    })
  }, [permission])

  const createNotification = useCallback(
    (title: string, options: NotificationOptions) => {
      if (permission === 'granted') {
        // Use ServiceWorkerRegistration to show the notification
        navigator.serviceWorker.ready.then(function (registration) {
          registration.showNotification(title, options)
        })
      }
    },
    [permission]
  )

  return (
    <WebNotificationContext.Provider
      value={{ permission, createNotification, requestPermission }}
    >
      {children}
    </WebNotificationContext.Provider>
  )
}

const useWebPushNotification = (): WebNotificationContextType => {
  const context = useContext(WebNotificationContext)
  if (!context) {
    throw new Error(
      'useWebPushNotification must be used within a WebNotificationProvider'
    )
  }
  return context
}

export { useWebPushNotification, WebNotificationProvider }
