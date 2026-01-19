'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { Button } from '@js-monorepo/components/ui/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { CalendarCheck, Search } from 'lucide-react'
import { useMyBookings } from '../../../lib/scheduling'
import { MyBookingsSkeleton, MyBookingsEmpty, BookingSection } from './components'

export default function MyBookingsPage() {
  const { session } = useSession()
  const { data, isLoading, error } = useMyBookings()

  const hasParticipantProfile = session?.appUser?.hasParticipantProfile

  // Show message if user doesn't have participant profile
  if (!hasParticipantProfile && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
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
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
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
        <MyBookingsEmpty />
      ) : (
        <div className="space-y-10">
          {/* Upcoming Bookings */}
          <BookingSection
            title="Upcoming"
            bookings={data.upcoming}
            emptyMessage="No upcoming bookings. Discover new classes to attend!"
          />

          {/* Cancelled Bookings */}
          {data.cancelled.length > 0 && <BookingSection title="Cancelled" bookings={data.cancelled} isCancelled />}

          {/* Past Bookings */}
          {data.past.length > 0 && <BookingSection title="Past" bookings={data.past} isPast />}
        </div>
      )}
    </div>
  )
}
