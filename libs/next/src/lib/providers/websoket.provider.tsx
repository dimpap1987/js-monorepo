'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export type WebSocketOptionsType = {
  url: string
  path?: string
}

type WebSocketContextType = {
  connectSocket: (opts: WebSocketOptionsType) => Socket | undefined
  unsubscribe: () => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
          console.warn(`Existing socket is not connected. Attempting to reconnect...`)
          socketRef.current.connect() // Attempt to reconnect
          return socketRef.current // Return the existing socket regardless
        }
      }

      // Create a new socket if none exists
      const socket = io(opts.url, {
        path: opts.path ?? '/ws',
        secure: true,
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 5000,
        forceNew: true,
        reconnectionAttempts: 60,
        transports: ['websocket'],
      })

      socketRef.current = socket

      socket.on('connect', () => {
        console.log(`Connected to url: ${opts.url} with socket id: ${socket.id}`)
      })

      socket.on('disconnect', (reason) => {
        console.log(`Disconnected from url: ${opts.url} socket id: ${socket.id}, reason: ${reason}`)
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

  return <WebSocketContext.Provider value={{ connectSocket, unsubscribe }}>{children}</WebSocketContext.Provider>
}

export const useWebSocket = (
  opts: WebSocketOptionsType,
  connect: boolean
): {
  socket: Socket | null
  isConnected: boolean
  disconnect: () => void
} => {
  const context = useContext(WebSocketContext) as WebSocketContextType
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }

  useEffect(() => {
    if (!connect) {
      context.unsubscribe()
      setIsConnected(false)
      setSocket(null)
      return
    }

    const existingSocket = context.connectSocket(opts)
    if (!existingSocket) return

    if (!socket || socket !== existingSocket) {
      setSocket(existingSocket)
    }

    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    existingSocket.on('connect', handleConnect)
    existingSocket.on('disconnect', handleDisconnect)

    // Set initial state
    setIsConnected(existingSocket.connected)

    return () => {
      existingSocket.off('connect', handleConnect)
      existingSocket.off('disconnect', handleDisconnect)
    }
  }, [connect, opts.url])

  return {
    socket,
    isConnected,
    disconnect: () => {
      if (socket && socket.connected) {
        context.unsubscribe()
        setIsConnected(false)
        setSocket(null)
      }
    },
  }
}

export function useSocketChannel<T>(
  socket: Socket | null,
  event: string,
  handler: (data: T) => void,
  subscribeEvent?: string,
  subscribePayload?: object
) {
  // Memoize the handler to avoid duplicate listeners
  const stableHandler = useCallback(handler, [handler])

  useEffect(() => {
    if (!socket) return

    const subscribe = () => {
      if (subscribeEvent) {
        socket.emit(subscribeEvent, subscribePayload ?? {})
      }
      socket.on(event, stableHandler)
    }

    if (socket.connected) {
      subscribe()
    }

    socket.on('connect', subscribe)

    // Cleanup to prevent duplicate handlers
    return () => {
      socket.off('connect', subscribe)
      socket.off(event, stableHandler)
    }
  }, [socket, event, subscribeEvent, JSON.stringify(subscribePayload), stableHandler])
}
