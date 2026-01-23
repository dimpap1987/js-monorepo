'use client'

import { Button } from '@js-monorepo/components/ui/button'
import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { useNotifications } from '@js-monorepo/notification'
import { ContainerTemplate } from '@js-monorepo/templates'
import { CalendarCheck, Search } from 'lucide-react'
import { useCallback } from 'react'
import { useBibikosSession } from '../../../lib/auth'
import { useMyBookings, useParticipant } from '../../../lib/scheduling'
import { BookingsGroupedView, MyBookingsSkeleton } from './components'
import { useScheduleCancellationUpdates } from './hooks/use-schedule-cancellation-updates'

export default function MyBookingsComponent() {
  const { session } = useBibikosSession()
  const { addNotification } = useNotifications()
  const { data: participant } = useParticipant()
  const { data, isLoading, error, refetch } = useMyBookings()

  // Subscribe to schedule cancellation updates via WebSocket
  useScheduleCancellationUpdates({
    participantId: participant?.id,
    onScheduleCancelled: useCallback(
      (payload) => {
        refetch()
        addNotification({
          message: `Class "${payload.classTitle}" has been cancelled`,
          type: 'information',
        })
      },
      [refetch, addNotification]
    ),
  })

  const hasParticipantProfile = session?.appUser?.hasParticipantProfile

  // Show message if user doesn't have participant profile
  if (!hasParticipantProfile && !isLoading) {
    return (
      <ContainerTemplate>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <CalendarCheck className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Start booking classes</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Discover fitness classes from instructors and book your first session to get started.
          </p>
          <DpNextNavLink href="/discover">
            <Button>
              <Search className="w-4 h-4 mr-2" />
              Discover Classes
            </Button>
          </DpNextNavLink>
        </div>
      </ContainerTemplate>
    )
  }

  return (
    <ContainerTemplate>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your class bookings</p>
        </div>
        <DpNextNavLink href="/discover">
          <Button variant="outline">
            <Search className="w-4 h-4 mr-2" />
            Find Classes
          </Button>
        </DpNextNavLink>
      </div>

      {/* Content */}
      {isLoading ? (
        <MyBookingsSkeleton />
      ) : error ? (
        <div className="text-center py-12 text-destructive">
          <p>Failed to load bookings. Please try again.</p>
        </div>
      ) : !data || (data.upcoming.length === 0 && data.past.length === 0 && data.cancelled.length === 0) ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <CalendarCheck className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              You haven&apos;t booked any classes yet. Discover classes from instructors and start your fitness journey!
            </p>
            <DpNextNavLink href="/discover">
              <Button>Discover Classes</Button>
            </DpNextNavLink>
          </CardContent>
        </Card>
      ) : (
        <BookingsGroupedView bookings={data} />
      )}
    </ContainerTemplate>
  )
}
