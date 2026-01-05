'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

const isDev = process.env.NODE_ENV === 'development'
// Dev: http://localhost:3333 | Prod: https://your-domain.com
const BASE_URL = isDev
  ? process.env.NEXT_PUBLIC_DEV_BACKEND_URL
  : typeof window !== 'undefined'
    ? window.location.origin
    : ''

export type WebSocketOptionsType = {
  url: string
  path?: string
}

// Base event map - clients should extend this
export type BaseWebSocketEventMap = {
  connect: void
  disconnect: string
}

// Default event map that can be extended by clients
export type WebSocketEventMap = BaseWebSocketEventMap & {
  [key: string]: any
}

type EventSubscription = {
  event: string
  handler: (...args: any[]) => void
  id: symbol
}

type WebSocketContextValue<TEventMap extends WebSocketEventMap = WebSocketEventMap> = {
  socket: Socket | null
  isConnected: boolean
  subscribe: <K extends keyof TEventMap & string>(event: K, handler: (data: TEventMap[K]) => void) => () => void
  emit: <T = any>(event: string, data?: T) => void
}

const WebSocketContext = createContext<WebSocketContextValue<any> | undefined>(undefined)

interface WebSocketProviderProps {
  children: React.ReactNode
  uri?: string
  shouldConnect?: boolean
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  shouldConnect = true,
  uri = '/presence',
}) => {
  const socketRef = useRef<Socket | null>(null)
  const subscriptionsRef = useRef<EventSubscription[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const shouldConnectRef = useRef(shouldConnect)

  useEffect(() => {
    shouldConnectRef.current = shouldConnect
  }, [shouldConnect])

  // Connection management
  useEffect(() => {
    if (!shouldConnect) {
      if (socketRef.current) {
        socketRef.current.removeAllListeners()
        socketRef.current.disconnect()
        socketRef.current = null
      }
      setIsConnected(false)
      return
    }

    // Disconnect existing socket first
    if (socketRef.current) {
      socketRef.current.removeAllListeners()
      socketRef.current.disconnect()
      socketRef.current = null
    }

    // Create new socket connection

    try {
      const socket = io(`${BASE_URL}${uri}`, {
        path: '/ws',
        secure: true,
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 1000, // Start with 1 second delay
        reconnectionDelayMax: 5000, // Max 5 seconds between attempts
        randomizationFactor: 0.5, // Add randomness to prevent thundering herd
        reconnectionAttempts: Infinity, // Keep trying indefinitely
        timeout: 20000, // Connection timeout (20 seconds)
        forceNew: true,
        transports: ['websocket'],
      })

      socketRef.current = socket

      // Setup connection event handlers
      socket.on('connect', () => {
        console.log(`WebSocket connected to: ${uri}`)
        setIsConnected(true)

        // Re-register all subscriptions on reconnect
        subscriptionsRef.current.forEach((sub) => {
          if (!socket.hasListeners(sub.event)) {
            socket.on(sub.event, sub.handler)
          }
        })
      })

      socket.on('disconnect', (reason) => {
        console.log(`WebSocket disconnected: ${reason}`)
        setIsConnected(false)

        if (reason === 'io server disconnect' && shouldConnectRef.current) {
          setTimeout(() => {
            if (socketRef.current && !socketRef.current.connected && shouldConnectRef.current) {
              socketRef.current.connect()
            }
          }, 5000)
        }
      })

      socket.on('reconnect', (attemptNumber) => {
        console.log(`WebSocket reconnected after ${attemptNumber} attempts`)
        setIsConnected(true)
      })

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error)
        setIsConnected(false)
      })

      socket.on('reconnect_failed', () => {
        console.error('WebSocket reconnection failed after all attempts')
        setIsConnected(false)
      })
    } catch (error) {
      console.error('Error creating WebSocket connection', error)
      setIsConnected(false)
    }

    // Cleanup on unmount or hot reload
    return () => {
      if (socketRef.current) {
        // Remove all event listeners before disconnecting
        socketRef.current.removeAllListeners()
        socketRef.current.disconnect()
        socketRef.current = null
      }
      subscriptionsRef.current = []
      setIsConnected(false)
    }
  }, [shouldConnect, uri])

  // Subscribe to an event with automatic cleanup
  const subscribe = useCallback(
    <K extends keyof WebSocketEventMap & string>(
      event: K,
      handler: (data: WebSocketEventMap[K]) => void
    ): (() => void) => {
      const subscriptionId = Symbol(`subscription-${event}`)
      const wrappedHandler = handler as (...args: any[]) => void

      // Add to subscriptions tracking
      subscriptionsRef.current.push({
        event: event as string,
        handler: wrappedHandler,
        id: subscriptionId,
      })

      // Register with socket if connected
      if (socketRef.current?.connected) {
        socketRef.current.on(event as string, wrappedHandler)
      }

      // Return unsubscribe function
      return () => {
        // Remove from tracking
        subscriptionsRef.current = subscriptionsRef.current.filter((sub) => sub.id !== subscriptionId)

        // Remove from socket
        if (socketRef.current) {
          socketRef.current.off(event as string, wrappedHandler)
        }
      }
    },
    []
  )

  // Emit event to server
  const emit = useCallback(<T = any,>(event: string, data?: T): void => {
    if (!socketRef.current?.connected) {
      console.warn(`Cannot emit ${event}: WebSocket not connected`)
      return
    }
    socketRef.current.emit(event, data)
  }, [])

  const value: WebSocketContextValue<any> = {
    socket: socketRef.current,
    isConnected,
    subscribe,
    emit,
  }

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
}

export const useWebSocketEnhanced = <
  TEventMap extends WebSocketEventMap = WebSocketEventMap,
>(): WebSocketContextValue<TEventMap> => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocketEnhanced must be used within WebSocketProvider')
  }
  return context as WebSocketContextValue<TEventMap>
}

/**
 * Hook to subscribe to a specific WebSocket event
 * Handles cleanup automatically and prevents handler recreation issues
 */
export const useWebSocketEvent = <
  TEventMap extends WebSocketEventMap = WebSocketEventMap,
  K extends keyof TEventMap & string = keyof TEventMap & string,
>(
  event: K & string,
  handler: (data: TEventMap[K]) => void,
  deps: React.DependencyList = []
): void => {
  const { subscribe } = useWebSocketEnhanced<TEventMap>()
  const handlerRef = useRef(handler)

  // Update handler ref when it changes (prevents re-subscription)
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    // Create stable wrapper that uses ref
    const stableHandler = ((...args: any[]) => {
      handlerRef.current(args[0] as TEventMap[K])
    }) as (data: TEventMap[K]) => void

    const unsubscribe = subscribe(event as K & string, stableHandler as (data: TEventMap[K & string]) => void)
    return unsubscribe
    // Only re-subscribe if event name changes, not handler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, subscribe, ...deps])
}

/**
 * Hook to get connection status
 */
export const useWebSocketStatus = (): {
  isConnected: boolean
} => {
  const { isConnected } = useWebSocketEnhanced()
  return { isConnected }
}

/**
 * Hook to emit events to server
 */
export const useWebSocketEmit = () => {
  const { emit } = useWebSocketEnhanced()
  return emit
}
