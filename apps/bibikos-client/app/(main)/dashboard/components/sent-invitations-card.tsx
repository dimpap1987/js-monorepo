'use client'

import { Badge } from '@js-monorepo/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@js-monorepo/components/ui/card'
import { Skeleton } from '@js-monorepo/components/ui/skeleton'
import { Check, Clock, Mail, X } from 'lucide-react'
import { useSentInvitations } from '../../../../lib/scheduling/queries'
import type { ClassInvitation } from '../../../../lib/scheduling/types'

export function SentInvitationsCard() {
  const { data: invitations, isLoading } = useSentInvitations()

  // Calculate stats
  const stats = invitations
    ? {
        total: invitations.length,
        pending: invitations.filter((i: ClassInvitation) => i.status === 'PENDING').length,
        accepted: invitations.filter((i: ClassInvitation) => i.status === 'ACCEPTED').length,
        declined: invitations.filter((i: ClassInvitation) => i.status === 'DECLINED').length,
      }
    : { total: 0, pending: 0, accepted: 0, declined: 0 }

  // Don't render if no invitations have ever been sent
  if (!isLoading && stats.total === 0) {
    return null
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="w-5 h-5 text-primary" />
          Sent Invitations
        </CardTitle>
        <CardDescription>Track your private class invitations</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10">
                <Clock className="w-4 h-4 text-yellow-600" />
                <div>
                  <p className="text-lg font-semibold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10">
                <Check className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-lg font-semibold">{stats.accepted}</p>
                  <p className="text-xs text-muted-foreground">Accepted</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10">
                <X className="w-4 h-4 text-red-600" />
                <div>
                  <p className="text-lg font-semibold">{stats.declined}</p>
                  <p className="text-xs text-muted-foreground">Declined</p>
                </div>
              </div>
            </div>

            {/* Recent pending invitations */}
            {stats.pending > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Awaiting response</p>
                {invitations
                  ?.filter((i: ClassInvitation) => i.status === 'PENDING')
                  .slice(0, 3)
                  .map((invitation: ClassInvitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {invitation.className}
                        </Badge>
                        <span className="truncate text-muted-foreground">
                          {invitation.invitedUsername || invitation.invitedEmail}
                        </span>
                      </div>
                    </div>
                  ))}
                {stats.pending > 3 && (
                  <p className="text-xs text-muted-foreground text-center">+{stats.pending - 3} more pending</p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
