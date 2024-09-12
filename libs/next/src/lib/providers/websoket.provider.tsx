'use client'

import { createContext, useContext, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'

type Subscription = {
  (
    namespace: string,
    event: string,
    callback: (data: any) => void
  ): { terminate: () => void }
  (namespace: string): { terminate: () => void }
}

type WebSocketContextType = {
  subscribe: Subscription
}

const WebSocketContext = createContext<WebSocketContextType>(
  {} as WebSocketContextType
)

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRefs = useRef<Map<string, Socket>>(new Map())
  const pingIntervals = useRef<Map<string, NodeJS.Timer>>(new Map())
  const listeners = useRef<Map<string, (data: any) => void>>(new Map())

  useEffect(() => {
    // Cleanup all sockets and intervals on unmount
    return () => {
      socketRefs.current.forEach((socket) => socket.disconnect())
      pingIntervals.current.forEach((interval) => clearInterval(interval))
      socketRefs.current.clear()
      pingIntervals.current.clear()
    }
  }, [])

  const unsubscribe = (listenerId: string) => {
    // Check if the listenerId exists before deleting
    if (!listeners.current.has(listenerId)) {
      console.warn(`Listener ID ${listenerId} does not exist.`)
      return
    }

    listeners.current.delete(listenerId)

    const namespace = listenerId.split('-')[0]

    const remainingListeners = Array.from(listeners.current.keys()).filter(
      (key) => key.startsWith(namespace)
    )

    // Disconnect the socket if there are no more listeners
    if (remainingListeners.length === 0) {
      const socket = socketRefs.current.get(namespace)
      if (socket) {
        console.debug(`Disconnecting socket for namespace: ${namespace}`)
        socket.disconnect()
        socketRefs.current.delete(namespace)
        const interval = pingIntervals.current.get(namespace)
        if (interval) {
          clearInterval(interval)
          pingIntervals.current.delete(namespace)
          console.debug(`Cleared ping interval for namespace: ${namespace}`)
        }
      }
    }
  }

  const subscribe: Subscription = (
    namespace: string,
    event?: string,
    callback?: (data: any) => void
  ) => {
    const listenerKey = `${namespace}-${event}-${uuidv4()}`

    if (event && callback) {
      listeners.current.set(listenerKey, callback)
    }
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

      if (event) {
        socket.on(event, (data) => {
          listeners.current.get(listenerKey)?.(data)
        })
      }

      // Set up ping interval
      if (namespace === 'presence') {
        const pingInterval = setInterval(() => {
          socket.emit('ping')
        }, 5000)
        pingIntervals.current.set(namespace, pingInterval)
      }
    }

    // Return an object with a terminate method
    return {
      terminate: () => {
        unsubscribe(listenerKey)
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
  return [context.subscribe]
}
