'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

type PingableSocket = Socket & { ping: () => void }

type WebSocketContextType = {
  connectSocket: (namespace?: string) => PingableSocket | undefined
  unsubscribe: (namespace: string) => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
)

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRefs = useRef<Map<string, Socket>>(new Map())
  const pingIntervalsRefs = useRef<Map<string, NodeJS.Timer>>(new Map())

  useEffect(() => {
    // Cleanup all sockets and intervals on unmount
    return () => {
      socketRefs.current.forEach((socket) => socket.disconnect())
      socketRefs.current.clear()
      pingIntervalsRefs.current.forEach((namespace) => clearInterval(namespace))
      pingIntervalsRefs.current.clear()
    }
  }, [])

  const connectSocket = (namespace?: string) => {
    if (!namespace) return undefined
    try {
      if (socketRefs.current.has(namespace)) {
        return socketRefs.current.get(namespace) as PingableSocket
      }

      const socket = io(
        `ws://${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/${namespace}`,
        {
          withCredentials: true,
          transports: ['websocket'],
        }
      ) as PingableSocket

      socketRefs.current.set(namespace, socket)

      socket.on('connect', () => {
        console.log(`Connected to namespace: ${namespace}`)
        socket.ping = () => {
          clearInterval(pingIntervalsRefs.current.get(namespace))
          const interval = setInterval(() => {
            if (socket.active) {
              socket.emit('ping')
            }
          }, 5000)

          pingIntervalsRefs.current.set(namespace, interval)
        }
      })

      socket.on('disconnect', () => {
        console.log(`Disconnected from namespace: ${namespace}`)
        socketRefs.current.delete(namespace)
        clearInterval(pingIntervalsRefs.current.get(namespace))
      })
      return socket
    } catch (e) {
      console.error('Error while creating websocket connection')
      return undefined
    }
  }

  const unsubscribe = (namespace: string) => {
    const socket = socketRefs.current.get(namespace)
    if (socket) {
      socket.disconnect() // Disconnect the socket
      socketRefs.current.delete(namespace) // Remove from the map
      clearInterval(pingIntervalsRefs.current.get(namespace))
      console.log(`Unsubscribed from namespace: ${namespace}`)
    } else {
      console.warn(`No socket found for namespace: ${namespace}`)
    }
  }

  return (
    <WebSocketContext.Provider value={{ connectSocket, unsubscribe }}>
      {children}
    </WebSocketContext.Provider>
  )
}

// Create a custom hook to use the WebSocket context
export const useWebSocket = (namespace: string): PingableSocket => {
  const context = useContext(WebSocketContext) as WebSocketContextType
  const [socket, setSocket] = useState<PingableSocket | undefined>(undefined)

  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }

  useEffect(() => {
    const newSocket = context.connectSocket(namespace) as PingableSocket
    setSocket(newSocket)
  }, [namespace])

  return socket as PingableSocket
}
