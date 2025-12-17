'use effect'

import { useEffect, useRef } from 'react'
import useInternetStatus from './internet-status'
import { useNotifications } from '@js-monorepo/notification'

export default function useOfflineNotification() {
  const { addNotification, removeNotification } = useNotifications()
  const isOnline = useInternetStatus()

  const offlineNotificationIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isOnline && offlineNotificationIdRef.current === null) {
      const id = addNotification({
        type: 'error',
        message: 'You are offline',
        description: 'Some features may not be available',
        closable: false,
      })

      offlineNotificationIdRef.current = id
    }

    if (isOnline && offlineNotificationIdRef.current !== null) {
      // User is back online — remove the existing offline notification
      removeNotification(offlineNotificationIdRef.current)
      offlineNotificationIdRef.current = null
    }
  }, [isOnline, addNotification, removeNotification])
}
