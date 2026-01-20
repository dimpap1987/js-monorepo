'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@js-monorepo/components/ui/card'
import { Skeleton } from '@js-monorepo/components/ui/skeleton'
import { Booking, BOOKING_STATUS } from '../../../../../lib/scheduling'
import { User } from 'lucide-react'
import { BookingCard } from './booking-card'
import { BookingFilters } from './booking-filters'
import { BookingStats } from './booking-stats'
import type { BookingsListProps } from '../types'

export function BookingsList({
  bookings,
  isLoading,
  searchQuery,
  statusFilter,
  onViewDetails,
  onToggleAttendance,
  isMarkingAttendance,
  onSearchChange,
  onStatusFilterChange,
}: BookingsListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bookings</CardTitle>
            <BookingStats
              total={bookings.length}
              booked={bookings.filter((b: Booking) => b.status === BOOKING_STATUS.BOOKED).length}
              waitlisted={bookings.filter((b: Booking) => b.status === BOOKING_STATUS.WAITLISTED).length}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <BookingFilters
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={onSearchChange}
          onStatusFilterChange={onStatusFilterChange}
        />

        {/* Bookings List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 text-foreground-muted">
            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No bookings found</p>
            {searchQuery || statusFilter !== 'all' ? <p className="text-sm mt-1">Try adjusting your filters</p> : null}
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onViewDetails={() => onViewDetails(booking)}
                onToggleAttendance={onToggleAttendance}
                isMarkingAttendance={isMarkingAttendance}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
