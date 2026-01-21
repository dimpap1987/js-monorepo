'use client'

import { Button } from '@js-monorepo/components/ui/button'
import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { CalendarSearch } from 'lucide-react'
import type { Booking, MyBookingsResponse } from '../../../../lib/scheduling'
import { BOOKING_STATUS } from '../../../../lib/scheduling'
import { BookingCardEnhanced } from './booking-card-enhanced'

interface BookingsGroupedViewProps {
  bookings: MyBookingsResponse<Booking>
}

interface SectionHeaderProps {
  title: string
  count: number
  description?: string
  singularLabel?: string
  pluralLabel?: string
}

function SectionHeader({
  title,
  count,
  description,
  singularLabel = 'booking',
  pluralLabel = 'bookings',
}: SectionHeaderProps) {
  const label = count === 1 ? singularLabel : pluralLabel

  return (
    <>
      <h3 className="mb-3 flex items-center gap-2">
        <span>{title}</span>
        <span className="text-sm text-muted-foreground">
          ({count} {label})
        </span>
      </h3>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </>
  )
}

function BookingList({
  bookings,
  isPastBooking,
  isCancelledSection,
  spacing = 'space-y-3',
}: {
  bookings: Booking[]
  isPastBooking?: boolean
  isCancelledSection?: boolean
  spacing?: string
}) {
  if (bookings.length === 0) return null

  return (
    <div className={spacing}>
      {bookings.map((booking) => (
        <BookingCardEnhanced
          key={booking.id}
          booking={booking}
          isPastBooking={isPastBooking}
          isCancelledSection={isCancelledSection}
        />
      ))}
    </div>
  )
}

function EmptyBookingsState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <CalendarSearch className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No bookings yet</h3>
        <p className="mb-6 max-w-sm text-muted-foreground">
          You haven&apos;t booked any classes yet. Discover classes from instructors and start your fitness journey!
        </p>
        <DpNextNavLink href="/discover">
          <Button>Discover Classes</Button>
        </DpNextNavLink>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                */
/* -------------------------------------------------------------------------- */

function groupBookings(bookings: MyBookingsResponse<Booking>) {
  return {
    upcoming: {
      booked: bookings.upcoming.filter((b) => b.status === BOOKING_STATUS.BOOKED),
      waitlisted: bookings.upcoming.filter((b) => b.status === BOOKING_STATUS.WAITLISTED),
    },
    past: {
      attended: bookings.past.filter((b) => b.status === BOOKING_STATUS.ATTENDED),
      noShow: bookings.past.filter((b) => b.status === BOOKING_STATUS.NO_SHOW),
      completed: bookings.past.filter(
        (b) =>
          b.status === BOOKING_STATUS.BOOKED ||
          b.status === BOOKING_STATUS.WAITLISTED ||
          b.status === BOOKING_STATUS.CANCELLED
      ),
    },
    cancelled: bookings.cancelled,
  }
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                              */
/* -------------------------------------------------------------------------- */

export function BookingsGroupedView({ bookings }: BookingsGroupedViewProps) {
  const grouped = groupBookings(bookings)

  const hasAnyBookings = bookings.upcoming.length > 0 || bookings.past.length > 0 || bookings.cancelled.length > 0

  if (!hasAnyBookings) {
    return <EmptyBookingsState />
  }

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------------ */}
      {/* Upcoming Classes                                                    */}
      {/* ------------------------------------------------------------------ */}
      {(grouped.upcoming.booked.length > 0 || grouped.upcoming.waitlisted.length > 0) && (
        <section>
          <SectionHeader title="Upcoming Classes" count={grouped.upcoming.booked.length} />

          <div className="space-y-6">
            <BookingList bookings={grouped.upcoming.booked} spacing="space-y-5" />

            {grouped.upcoming.waitlisted.length > 0 && (
              <div>
                <SectionHeader title="Waitlisted" count={grouped.upcoming.waitlisted.length} />
                <BookingList bookings={grouped.upcoming.waitlisted} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Cancelled                                                           */}
      {/* ------------------------------------------------------------------ */}
      {grouped.cancelled.length > 0 && (
        <section>
          <SectionHeader
            title="Cancelled"
            count={grouped.cancelled.length}
            description="Recently cancelled upcoming bookings"
          />
          <BookingList bookings={grouped.cancelled} isCancelledSection />
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Past Classes                                                        */}
      {/* ------------------------------------------------------------------ */}
      {(grouped.past.attended.length > 0 || grouped.past.noShow.length > 0 || grouped.past.completed.length > 0) && (
        <section>
          <h3 className="mb-3">Past Classes</h3>
          <div className="space-y-6">
            <BookingList bookings={grouped.past.attended} isPastBooking />
            <BookingList bookings={grouped.past.noShow} isPastBooking />
            <BookingList bookings={grouped.past.completed} isPastBooking />
          </div>
        </section>
      )}
    </div>
  )
}
