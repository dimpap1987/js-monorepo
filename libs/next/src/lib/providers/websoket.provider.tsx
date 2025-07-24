'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

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

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'

type EventSubscription = {
  event: string
  handler: (...args: any[]) => void
  id: symbol
}

type WebSocketContextValue<TEventMap extends WebSocketEventMap = WebSocketEventMap> = {
  socket: Socket | null
  isConnected: boolean
  connectionState: ConnectionState
  subscribe: <K extends keyof TEventMap & string>(event: K, handler: (data: TEventMap[K]) => void) => () => void
  emit: <T = any>(event: string, data?: T) => void
  getConnectionState: () => ConnectionState
}

const WebSocketContext = createContext<WebSocketContextValue<any> | undefined>(undefined)

interface WebSocketProviderProps {
  children: React.ReactNode
  options: WebSocketOptionsType
  shouldConnect?: boolean
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, options, shouldConnect = true }) => {
  const socketRef = useRef<Socket | null>(null)
  const subscriptionsRef = useRef<EventSubscription[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const optionsRef = useRef(options)

  // Update options ref when they change
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  // Connection management
  useEffect(() => {
    if (!shouldConnect || !optionsRef.current?.url) {
      if (socketRef.current) {
        socketRef.current.removeAllListeners()
        socketRef.current.disconnect()
        socketRef.current = null
      }
      setConnectionState('disconnected')
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
    setConnectionState('connecting')

    try {
      // Check if socket exists and is connected (reconnection fix from develop)
      if (socketRef.current) {
        if (socketRef.current.connected) {
          setConnectionState('connected')
          setIsConnected(true)
          return // Use existing connected socket
        } else {
          console.warn(`Existing socket is not connected. Attempting to reconnect...`)
          socketRef.current.connect() // Attempt to reconnect
          setConnectionState('reconnecting')
          return // Use existing socket
        }
      }

      // Create a new socket if none exists
      const socket = io(optionsRef.current.url, {
        path: optionsRef.current.path ?? '/ws',
        secure: true,
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 5000,
        forceNew: true,
        reconnectionAttempts: 60,
        transports: ['websocket'],
      })

      socketRef.current = socket

      // Setup connection event handlers
      socket.on('connect', () => {
        console.log(`WebSocket connected to: ${optionsRef.current.url}`)
        setConnectionState('connected')
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

        if (reason === 'io server disconnect') {
          // Server disconnected, client will reconnect
          setConnectionState('reconnecting')
        } else {
          setConnectionState('disconnected')
        }
      })

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error)
        setConnectionState('error')
        setIsConnected(false)
      })
    } catch (error) {
      console.error('Error creating WebSocket connection', error)
      setConnectionState('error')
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
      setConnectionState('disconnected')
      setIsConnected(false)
    }
  }, [shouldConnect])

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

  const getConnectionState = useCallback((): ConnectionState => {
    return connectionState
  }, [connectionState])

  const value: WebSocketContextValue<any> = {
    socket: socketRef.current,
    isConnected,
    connectionState,
    subscribe,
    emit,
    getConnectionState,
  }

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
}

<<<<<<< HEAD
/**
 * Hook to access WebSocket context
 */
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
  connectionState: ConnectionState
} => {
  const { isConnected, connectionState } = useWebSocketEnhanced()
  return { isConnected, connectionState }
}

/**
 * Hook to emit events to server
 */
export const useWebSocketEmit = () => {
  const { emit } = useWebSocketEnhanced()
  return emit
}

// Export ConnectionState for client use
export type { ConnectionState }
