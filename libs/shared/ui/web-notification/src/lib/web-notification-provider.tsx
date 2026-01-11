'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { registerServiceWorker, requestPushPermission, subscribeNotifactionToServer } from './utils'

interface WebNotificationContextType {
  permission: NotificationPermission
  requestPermission: () => Promise<void>
  createNotification: (title: string, options?: NotificationOptions) => void
}

const WebNotificationContext = createContext<WebNotificationContextType | null>(null)

export function WebNotificationProvider({ children }: { children: ReactNode }) {
  const { session } = useSession()
  const userId = session?.user?.id

  const [permission, setPermission] = useState<NotificationPermission>('default')

  // Read Notification ONLY after mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return

    setPermission(Notification.permission)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!userId) return
    if (!('Notification' in window)) return

    registerServiceWorker().then(async () => {
      if (Notification.permission !== 'granted') return

      await navigator.serviceWorker.ready
      await subscribeNotifactionToServer(userId)
    })
  }, [userId])

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return
    if (!userId) return

    const perm = await requestPushPermission()
    setPermission(perm)

    if (perm === 'granted') {
      await subscribeNotifactionToServer(userId)
    }
  }, [userId])

  const createNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permission !== 'granted') return
      if (typeof window === 'undefined') return

      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options)
      })
    },
    [permission]
  )

  return (
    <WebNotificationContext.Provider value={{ permission, requestPermission, createNotification }}>
      {children}
    </WebNotificationContext.Provider>
  )
}

export function useWebPushNotification(): WebNotificationContextType {
  const ctx = useContext(WebNotificationContext)

  if (!ctx) {
    throw new Error('useWebPushNotification must be used inside WebNotificationProvider')
  }

  return ctx
}
