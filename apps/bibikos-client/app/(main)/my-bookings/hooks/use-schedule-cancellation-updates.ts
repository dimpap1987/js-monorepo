'use client'

import {
  useWebSocketEvent,
  useWebSocketEmit,
  useWebSocketStatus,
  type BaseWebSocketEventMap,
} from '@js-monorepo/next/providers'
import { useEffect, useRef } from 'react'

interface ScheduleCancelledPayload {
  scheduleId: number
  classTitle: string
  timestamp: string
}

type ScheduleCancellationEventMap = BaseWebSocketEventMap & {
  'events:schedule-cancelled': ScheduleCancelledPayload
}

interface UseScheduleCancellationUpdatesOptions {
  participantId: number | undefined
  onScheduleCancelled: (payload: ScheduleCancelledPayload) => void
}

export function useScheduleCancellationUpdates({
  participantId,
  onScheduleCancelled,
}: UseScheduleCancellationUpdatesOptions) {
  const { isConnected } = useWebSocketStatus()
  const emit = useWebSocketEmit()
  const joinedRoomRef = useRef<number | null>(null)

  // Subscribe to schedule cancelled events
  useWebSocketEvent<ScheduleCancellationEventMap, 'events:schedule-cancelled'>(
    'events:schedule-cancelled',
    (payload) => {
      onScheduleCancelled(payload)
    }
  )

  // Join/leave participant room based on connection status
  useEffect(() => {
    if (!isConnected || !participantId) return

    // Join the participant room
    emit('subscribe:join-participant-room', participantId)
    joinedRoomRef.current = participantId

    return () => {
      // Leave the participant room on cleanup
      if (joinedRoomRef.current) {
        emit('subscribe:leave-participant-room', joinedRoomRef.current)
        joinedRoomRef.current = null
      }
    }
  }, [isConnected, participantId, emit])
}
