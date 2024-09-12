'use client'

import { createContext, useContext, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

type WebSocketContextType = {
  subscribe: (
    namespace: string,
    event: string,
    callback: (data: any) => void
  ) => { terminate: () => void }
}

const WebSocketContext = createContext<WebSocketContextType>(
  {} as WebSocketContextType
)

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRefs = useRef<Map<string, Socket>>(new Map())
  const pingIntervals = useRef<Map<string, NodeJS.Timer>>(new Map())
  const listeners = useRef<Map<string, Array<(data: any) => void>>>(new Map())

  useEffect(() => {
    // Cleanup all sockets and intervals on unmount
    return () => {
      socketRefs.current.forEach((socket) => socket.disconnect())
      pingIntervals.current.forEach((interval) => clearInterval(interval))
      socketRefs.current.clear()
      pingIntervals.current.clear()
    }
  }, [])

  const unsubscribe = (
    namespace: string,
    event: string,
    callback: (data: any) => void
  ) => {
    const callbacks = listeners.current.get(event)
    if (callbacks) {
      listeners.current.set(
        event,
        callbacks.filter((cb) => cb !== callback)
      )
    }

    // Disconnect the socket if there are no more listeners
    if (callbacks?.length === 0) {
      const socket = socketRefs.current.get(namespace)
      if (socket) {
        socket.disconnect()
        socketRefs.current.delete(namespace)
        const interval = pingIntervals.current.get(namespace)
        if (interval) {
          clearInterval(interval)
          pingIntervals.current.delete(namespace)
        }
      }
    }
  }

  const subscribe = (
    namespace: string,
    event: string,
    callback: (data: any) => void
  ) => {
    if (!listeners.current.has(event)) {
      listeners.current.set(event, [])
    }
    listeners.current.get(event)?.push(callback)

    // Create a socket connection for the specified namespace if it doesn't exist
    if (!socketRefs.current.has(namespace)) {
      const socket = io(
        `ws://${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/${namespace}`,
        {
          withCredentials: true,
          transports: ['websocket'],
        }
      )

      socketRefs.current.set(namespace, socket)

      socket.on('connect', () => {
        console.log(`Connected to namespace: ${namespace}`)
      })

      socket.on('disconnect', () => {
        console.log(`Disconnected from namespace: ${namespace}`)
      })

      // Register event listeners
      const handleEvent = (data: any) => {
        const callbacks = listeners.current.get(event)
        if (callbacks) {
          callbacks.forEach((cb) => cb(data))
        }
      }

      socket.on(event, handleEvent)

      // Set up ping interval
      const pingInterval = setInterval(() => {
        socket.emit('ping')
      }, 5000)
      pingIntervals.current.set(namespace, pingInterval)
    }

    // Return an object with a terminate method
    return {
      terminate: () => {
        unsubscribe(namespace, event, callback)
      },
    }
  }

  return (
    <WebSocketContext.Provider value={{ subscribe }}>
      {children}
    </WebSocketContext.Provider>
  )
}

// Create a custom hook to use the WebSocket context
export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}
