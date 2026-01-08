'use client'

import { useWebSocketEvent } from '@js-monorepo/next/providers'
import { UserNotificationType } from '@js-monorepo/types/notifications'
import { useEffect, useRef } from 'react'
import { NOTIFICATIONS_EVENT, type NotificationWebSocketEventMap } from '../types/websocket-events'

export function useNotificationWebSocket(onReceive: (notification: UserNotificationType) => void): void {
  const handlerRef = useRef(onReceive)

  useEffect(() => {
    handlerRef.current = onReceive
  }, [onReceive])

  useWebSocketEvent<NotificationWebSocketEventMap, typeof NOTIFICATIONS_EVENT>(NOTIFICATIONS_EVENT, (data) => {
    if (data && typeof data === 'object' && 'data' in data) {
      handlerRef.current(data.data)
    }
  })
}
