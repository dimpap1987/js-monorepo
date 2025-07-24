import { useNotifications } from '@js-monorepo/notification'
import { useEffect, useRef } from 'react'
import useInternetStatus from './internet-status'

export default function useOfflineNotification() {
  const { addNotification, removeNotification } = useNotifications()
  const isOnline = useInternetStatus()

  const offlineNotificationIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isOnline && offlineNotificationIdRef.current === null) {
      // User went offline — show notification and store its ID
      const id = addNotification({
        type: 'error',
        message: 'You are offline',
        description: 'Some features may not be available',
        canClose: true,
        duration: 6000 * 60,
      })

      offlineNotificationIdRef.current = id || null
    }

    if (isOnline && offlineNotificationIdRef.current !== null) {
      // User is back online — remove the existing offline notification
      removeNotification(offlineNotificationIdRef.current)
      offlineNotificationIdRef.current = null
    }
  }, [isOnline, addNotification, removeNotification])
}
