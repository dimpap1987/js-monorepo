'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

type PingableSocket = Socket & { ping: () => void }

export type WebSocketOptionsType = {
  url: string
  path?: string
}

type WebSocketContextType = {
  connectSocket: (opts: WebSocketOptionsType) => PingableSocket | undefined
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

  const connectSocket = (opts: WebSocketOptionsType) => {
    if (!opts?.url) return undefined
    try {
      if (socketRefs.current.has(opts.url)) {
        return socketRefs.current.get(opts.url) as PingableSocket
      }

      const socket = io(opts.url, {
        path: opts.path ? opts.path : '/ws',
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
        transports: ['websocket'],
      }) as PingableSocket

      socketRefs.current.set(opts.url, socket)

      socket.on('connect', () => {
        console.log(`Connected to url: ${opts.url}`)
        socket.ping = () => {
          clearInterval(pingIntervalsRefs.current.get(opts.url))
          const interval = setInterval(() => {
            if (socket.active) {
              socket.emit('ping')
            }
          }, 5000)

          pingIntervalsRefs.current.set(opts.url, interval)
        }
      })

      socket.on('disconnect', () => {
        console.log(`Disconnected from url: ${opts.url}`)
        socketRefs.current.delete(opts.url)
        clearInterval(pingIntervalsRefs.current.get(opts.url))
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
      if (pingIntervalsRefs.current.get(url)) {
        clearInterval(pingIntervalsRefs.current.get(url))
      }
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
  opts: WebSocketOptionsType,
  connect: boolean
): PingableSocket => {
  const context = useContext(WebSocketContext) as WebSocketContextType
  const [socket, setSocket] = useState<PingableSocket | undefined>(undefined)

  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }

  useEffect(() => {
    if (connect) {
      const newSocket = context.connectSocket(opts) as PingableSocket
      setSocket(newSocket)
    } else {
      context.unsubscribe(opts.url)
      setSocket(undefined)
    }
    return () => {
      socket?.disconnect()
    }
  }, [opts.url, connect])

  return socket as PingableSocket
}
