'use client'

import {
  useWebSocketEvent,
  useWebSocketEmit,
  useWebSocketStatus,
  type BaseWebSocketEventMap,
} from '@js-monorepo/next/providers'
import { useEffect, useRef } from 'react'

interface BookingUpdatePayload {
  scheduleId: number
  action: 'created' | 'cancelled'
  timestamp: string
}

type BookingUpdateEventMap = BaseWebSocketEventMap & {
  'events:booking-update': BookingUpdatePayload
}

interface UseBookingUpdatesOptions {
  organizerId: number | undefined
  onBookingUpdate: (payload: BookingUpdatePayload) => void
}

export function useBookingUpdates({ organizerId, onBookingUpdate }: UseBookingUpdatesOptions) {
  const { isConnected } = useWebSocketStatus()
  const emit = useWebSocketEmit()
  const joinedRoomRef = useRef<number | null>(null)

  // Subscribe to booking update events
  useWebSocketEvent<BookingUpdateEventMap, 'events:booking-update'>('events:booking-update', (payload) => {
    onBookingUpdate(payload)
  })

  // Join/leave organizer room based on connection status
  useEffect(() => {
    if (!isConnected || !organizerId) return

    // Join the organizer room
    emit('subscribe:join-organizer-room', organizerId)
    joinedRoomRef.current = organizerId

    return () => {
      // Leave the organizer room on cleanup
      if (joinedRoomRef.current) {
        emit('subscribe:leave-organizer-room', joinedRoomRef.current)
        joinedRoomRef.current = null
      }
    }
  }, [isConnected, organizerId, emit])
}
