'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

type PingableSocket = Socket & { ping: () => void }

type WebSocketContextType = {
  connectSocket: (url?: string) => PingableSocket | undefined
  unsubscribe: (url: string) => void
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
      pingIntervalsRefs.current.forEach((url) => clearInterval(url))
      pingIntervalsRefs.current.clear()
    }
  }, [])

  const connectSocket = (url?: string) => {
    if (!url) return undefined
    try {
      if (socketRefs.current.has(url)) {
        return socketRefs.current.get(url) as PingableSocket
      }

      const socket = io(url, {
        withCredentials: true,
        transports: ['websocket'],
      }) as PingableSocket

      socketRefs.current.set(url, socket)

      socket.on('connect', () => {
        console.log(`Connected to url: ${url}`)
        socket.ping = () => {
          clearInterval(pingIntervalsRefs.current.get(url))
          const interval = setInterval(() => {
            if (socket.active) {
              socket.emit('ping')
            }
          }, 5000)

          pingIntervalsRefs.current.set(url, interval)
        }
      })

      socket.on('disconnect', () => {
        console.log(`Disconnected from url: ${url}`)
        socketRefs.current.delete(url)
        clearInterval(pingIntervalsRefs.current.get(url))
      })
      return socket
    } catch (e) {
      console.error('Error while creating websocket connection')
      return undefined
    }
  }

  const unsubscribe = (url: string) => {
    const socket = socketRefs.current.get(url)
    if (socket) {
      socket.disconnect() // Disconnect the socket
      socketRefs.current.delete(url) // Remove from the map
      clearInterval(pingIntervalsRefs.current.get(url))
      console.log(`Unsubscribed from url: ${url}`)
    } else {
      console.warn(`No socket found for url: ${url}`)
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
  url: string,
  shouldConnect: boolean
): PingableSocket => {
  const context = useContext(WebSocketContext) as WebSocketContextType
  const [socket, setSocket] = useState<PingableSocket | undefined>(undefined)

  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }

  useEffect(() => {
    if (shouldConnect) {
      const newSocket = context.connectSocket(url) as PingableSocket
      setSocket(newSocket)
    } else {
      context.unsubscribe(url)
      setSocket(undefined)
    }
  }, [url, shouldConnect])

  return socket as PingableSocket
}
