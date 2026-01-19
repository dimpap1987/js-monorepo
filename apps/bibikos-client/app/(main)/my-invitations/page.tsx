'use client'

import { Badge } from '@js-monorepo/components/ui/badge'
import { Button } from '@js-monorepo/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@js-monorepo/components/ui/card'
import { Skeleton } from '@js-monorepo/components/ui/skeleton'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { formatDistanceToNow } from 'date-fns'
import { Check, Loader2, Mail, MailOpen, Search, User, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useInvitationWebSocket } from '../../../lib/scheduling/hooks/use-invitation-websocket'
import { usePendingInvitations, useRespondToInvitation } from '../../../lib/scheduling/queries'
import type { PendingInvitation } from '../../../lib/scheduling/types'

function InvitationsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border/50">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function InvitationsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <MailOpen className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No pending invitations</h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        When instructors invite you to their private classes, they will appear here.
      </p>
      <DpNextNavLink href="/discover">
        <Button>
          <Search className="w-4 h-4 mr-2" />
          Discover Public Classes
        </Button>
      </DpNextNavLink>
    </div>
  )
}

interface InvitationCardProps {
  invitation: PendingInvitation
  onAccept: () => void
  onDecline: () => void
  isResponding: boolean
}

function InvitationCard({ invitation, onAccept, onDecline, isResponding }: InvitationCardProps) {
  return (
    <Card className="border-border/50 hover:shadow-md transition-shadow flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{invitation.className}</CardTitle>
            {invitation.organizerName && (
              <CardDescription className="flex items-center gap-1 mt-1">
                <User className="w-3 h-3" />
                by {invitation.organizerName}
              </CardDescription>
            )}
          </div>
          <Badge variant="secondary" className="shrink-0">
            <Mail className="w-3 h-3 mr-1" />
            Invited
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        {/* Content area - grows to fill space */}
        <div className="flex-1 space-y-3">
          {invitation.classDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2">{invitation.classDescription}</p>
          )}

          {invitation.message && (
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="text-xs text-muted-foreground mb-1">Personal message:</p>
              <p className="italic">&ldquo;{invitation.message}&rdquo;</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Invited {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
          </p>
        </div>

        {/* Actions - always at bottom */}
        <div className="flex items-center gap-2 pt-4 mt-auto">
          <Button onClick={onAccept} disabled={isResponding} className="flex-1 gap-1">
            {isResponding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Accept
          </Button>
          <Button variant="outline" onClick={onDecline} disabled={isResponding} className="flex-1 gap-1">
            {isResponding ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
            Decline
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MyInvitationsPage() {
  const { data: invitations, isLoading, refetch } = usePendingInvitations()
  const respondMutation = useRespondToInvitation()
  const [respondingId, setRespondingId] = useState<number | null>(null)

  useInvitationWebSocket()

  const handleRespond = async (invitationId: number, status: 'ACCEPTED' | 'DECLINED') => {
    setRespondingId(invitationId)
    try {
      await respondMutation.mutateAsync({ invitationId, status })
      toast.success(status === 'ACCEPTED' ? 'Invitation accepted! You can now book sessions.' : 'Invitation declined')
      refetch()
    } catch (error) {
      toast.error('Failed to respond to invitation')
    } finally {
      setRespondingId(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Invitations</h1>
          <p className="text-muted-foreground">View and respond to private class invitations</p>
        </div>
        <DpNextNavLink href="/discover">
          <Button variant="outline">
            <Search className="w-4 h-4 mr-2" />
            Discover Classes
          </Button>
        </DpNextNavLink>
      </div>

      {/* Content */}
      {isLoading ? (
        <InvitationsSkeleton />
      ) : !invitations || invitations.length === 0 ? (
        <InvitationsEmpty />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {invitations.map((invitation: PendingInvitation) => (
            <InvitationCard
              key={invitation.id}
              invitation={invitation}
              onAccept={() => handleRespond(invitation.id, 'ACCEPTED')}
              onDecline={() => handleRespond(invitation.id, 'DECLINED')}
              isResponding={respondingId === invitation.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
