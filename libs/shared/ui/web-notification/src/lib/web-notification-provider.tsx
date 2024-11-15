'use client'

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

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

  // Register the service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(function (registration) {
          console.log(
            'Service Worker registered with scope:',
            registration.scope
          )
        })
        .catch(function (error) {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])

  const requestPermission = useCallback(() => {
    if ('Notification' in window && permission !== 'granted') {
      Notification.requestPermission().then((perm) => {
        setPermission(perm)
      })
    }
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

// Custom hook to use the notification context
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
