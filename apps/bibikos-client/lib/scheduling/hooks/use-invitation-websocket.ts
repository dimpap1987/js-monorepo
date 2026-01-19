'use client'

import { useWebSocketEvent, type BaseWebSocketEventMap } from '@js-monorepo/next/providers'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { schedulingKeys } from '../queries'

// WebSocket event name for class invitations
const CLASS_INVITATION_EVENT = 'events:class-invitation' as const

interface ClassInvitationPayload {
  type: 'NEW_INVITATION'
  message: string
  className: string
  organizerName: string | null
}

interface ClassInvitationWebSocketEventMap extends BaseWebSocketEventMap {
  [CLASS_INVITATION_EVENT]: ClassInvitationPayload
}

/**
 * Hook to listen for class invitation WebSocket events
 * Shows toast notifications and invalidates the pending invitations query
 */
export function useInvitationWebSocket(): void {
  const queryClient = useQueryClient()
  const handledIdsRef = useRef(new Set<string>())

  const handleInvitation = (data: ClassInvitationPayload) => {
    // Create a unique key for this notification to avoid duplicates
    const notificationKey = `${data.className}-${Date.now()}`

    if (handledIdsRef.current.has(notificationKey)) {
      return
    }
    handledIdsRef.current.add(notificationKey)

    // Show toast notification
    if (data.type === 'NEW_INVITATION') {
      toast.info(data.message, {
        description: `You've been invited to "${data.className}"`,
        action: {
          label: 'View',
          onClick: () => {
            window.location.href = '/my-invitations'
          },
        },
      })
    }

    // Invalidate pending invitations query to refresh the list
    queryClient.invalidateQueries({ queryKey: schedulingKeys.invitationsPending() })
  }

  useWebSocketEvent<ClassInvitationWebSocketEventMap, typeof CLASS_INVITATION_EVENT>(
    CLASS_INVITATION_EVENT,
    handleInvitation
  )

  // Cleanup old notification keys periodically
  useEffect(() => {
    const interval = setInterval(() => {
      handledIdsRef.current.clear()
    }, 60000) // Clear every minute

    return () => clearInterval(interval)
  }, [])
}
