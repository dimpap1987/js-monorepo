'use client'

import type { Booking } from '../../../../lib/scheduling'
import { BookingCard } from './booking-card'

interface BookingSectionProps {
  title: string
  bookings: Booking[]
  isPast?: boolean
  emptyMessage?: string
}

export function BookingSection({ title, bookings, isPast = false, emptyMessage }: BookingSectionProps) {
  if (bookings.length === 0 && emptyMessage) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground text-sm py-4">{emptyMessage}</p>
      </div>
    )
  }

  if (bookings.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="text-sm text-muted-foreground">
          {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
        </span>
      </div>
      <div className="space-y-3">
        {bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} isPastBooking={isPast} />
        ))}
      </div>
    </div>
  )
}
