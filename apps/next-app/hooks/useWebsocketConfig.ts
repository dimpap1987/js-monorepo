'use client'

import { useSocketChannel, useWebSocket } from '@js-monorepo/next/providers'
import { websocketOptions } from '@next-app/utils/websocket.config'
import { useCallback, useEffect } from 'react'

export const useWebSocketConfig = (isLoggedIn: boolean, isAdmin: boolean, refreshSession: () => void) => {
  const { socket, disconnect } = useWebSocket(websocketOptions, isLoggedIn)

  const handleRefresh = useCallback(() => {
    setTimeout(refreshSession, 1000)
  }, [refreshSession])

  // Use the reusable hook for announcements subscription and refresh-session event handling
  useSocketChannel(socket, 'events:refresh-session', handleRefresh, 'subscribe:announcements', {})

  // Admin room subscription, which is just a one-off emit with no listening:
  useEffect(() => {
    if (!socket || !isAdmin) return

    socket.emit('subscribe:join-admin-room', {})

    return () => {
      socket.emit('unsubscribe:leave-admin-room', {})
    }
  }, [socket, isAdmin])

  return { socket, disconnect }
}
