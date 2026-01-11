'use client'

import {
  useWebSocketEvent,
  useWebSocketEmit,
  useWebSocketStatus,
  type BaseWebSocketEventMap,
} from '@js-monorepo/next/providers'
import { useEffect } from 'react'

type WebSocketConfigEventMap = BaseWebSocketEventMap & {
  'events:refresh-session': boolean
}

export const useWebSocketConfig = (isLoggedIn: boolean, isAdmin: boolean, refreshSession: () => void) => {
  const { isConnected } = useWebSocketStatus()
  const emit = useWebSocketEmit()

  // Subscribe to refresh session event
  useWebSocketEvent<WebSocketConfigEventMap, 'events:refresh-session'>('events:refresh-session', () => {
    setTimeout(() => {
      refreshSession()
    }, 1000)
  })

  // Subscribe to connect event and emit announcements subscription
  useWebSocketEvent<WebSocketConfigEventMap, 'connect'>('connect', () => {
    emit('subscribe:announcements', {})
  })

  // Emit announcements subscription when connected
  useEffect(() => {
    if (isConnected) {
      emit('subscribe:announcements', {})
    }
  }, [isConnected, emit])

  // Handle admin room subscription
  useEffect(() => {
    if (!isConnected || !isAdmin) return

    emit('subscribe:join-admin-room', {})

    return () => {
      emit('unsubscribe:leave-admin-room', {})
    }
  }, [isConnected, isAdmin, emit])

  return {}
}
