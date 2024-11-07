'use client'

import { useWebSocket } from '@js-monorepo/next/providers'
import { websocketOptions } from '@next-app/utils/websocket.config'
import { useEffect } from 'react'

export const useWebSocketConfig = (
  isLoggedIn: boolean,
  isAdmin: boolean,
  refreshSession: () => void
) => {
  const { socket, disconnect } = useWebSocket(websocketOptions, isLoggedIn)

  useEffect(() => {
    if (!socket) return

    socket.on('connect', () => {
      socket.emit('subscribe:announcements', {})
      socket.on('events:refresh-session', () => {
        setTimeout(() => {
          refreshSession()
        }, 1000)
      })
    })

    return () => {
      disconnect()
    }
  }, [socket])

  useEffect(() => {
    if (!socket || !isAdmin) return

    socket.emit('subscribe:join-admin-room', {})

    return () => {
      socket.emit('unsubscribe:leave-admin-room', {})
    }
  }, [socket, isAdmin])

  return { socket }
}
