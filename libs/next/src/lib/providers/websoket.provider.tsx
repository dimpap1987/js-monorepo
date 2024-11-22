'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export type WebSocketOptionsType = {
  url: string
  path?: string
}

type WebSocketContextType = {
  connectSocket: (opts: WebSocketOptionsType) => Socket | undefined
  unsubscribe: () => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
)

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<Socket | null>(null) // Single socket reference

  useEffect(() => {
    // Cleanup the socket on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        console.log('WebSocket disconnected on cleanup')
      }
    }
  }, [])

  const connectSocket = (opts: WebSocketOptionsType) => {
    if (!opts?.url) return undefined

    try {
      if (socketRef.current) {
        if (socketRef.current.connected) {
          return socketRef.current // Return existing connected socket
        } else {
          console.warn(
            `Existing socket is not connected. Attempting to reconnect...`
          )
          socketRef.current.connect() // Attempt to reconnect
          return socketRef.current // Return the existing socket regardless
        }
      }

      // Create a new socket if none exists
      const socket = io(opts.url, {
        path: opts.path ? opts.path : '/ws',
        secure: true,
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
        transports: ['websocket'],
      })

      socketRef.current = socket

      socket.on('connect', () => {
        console.log(`Connected to url: ${opts.url}`)
      })

      socket.on('disconnect', () => {
        console.log(`Disconnected from url: ${opts.url}`)
      })

      return socket
    } catch (e) {
      console.error('Error while creating websocket connection', e)
      return undefined
    }
  }

  const unsubscribe = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      console.log('WebSocket unsubscribed and disconnected')
      socketRef.current = null
    }
  }

  return (
    <WebSocketContext.Provider value={{ connectSocket, unsubscribe }}>
      {children}
    </WebSocketContext.Provider>
  )
}

// Create a custom hook to use the WebSocket context
export const useWebSocket = (
  opts: WebSocketOptionsType,
  connect: boolean
): {
  socket: Socket | null
  disconnect: () => void
} => {
  const context = useContext(WebSocketContext) as WebSocketContextType
  const [socket, setSocket] = useState<Socket | null>(null)

  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }

  useEffect(() => {
    if (connect) {
      const newSocket = context.connectSocket(opts) as Socket
      setSocket(newSocket)
    } else {
      context.unsubscribe()
      setSocket(null)
    }
  }, [opts.url, connect])

  return {
    socket,
    disconnect: () => {
      if (socket && socket.connected) {
        context.unsubscribe()
        setSocket(null)
      }
    },
  }
}
