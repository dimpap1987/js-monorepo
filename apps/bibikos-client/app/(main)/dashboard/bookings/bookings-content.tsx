'use client'

import { BackButton } from '@js-monorepo/back-arrow'
import { useNotifications } from '@js-monorepo/notification'
import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import {
  Booking,
  BOOKING_STATUS,
  ClassSchedule,
  useBookingsForSchedule,
  useCancelBookingByOrganizer,
  useClasses,
  useMarkAttendance,
  useSchedulesCalendar,
  useUpdateBookingNotes,
} from '../../../../lib/scheduling'
import { BookingDetailDialog } from './components/booking-detail-dialog'
import { BookingsList } from './components/bookings-list'
import { BookingsSkeleton } from './components/bookings-skeleton'
import { ScheduleSelector } from './components/schedule-selector'
import type { DateRange } from './types'
import { ContainerTemplate } from '@js-monorepo/templates'

export function BookingsContent() {
  const { addNotification } = useNotifications()

  // State
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedClassId, setSelectedClassId] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange>({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  })

  // Fetch data
  // Include cancelled schedules with bookings so organizers can see all bookings
  const { data: schedulesData, isLoading: schedulesLoading } = useSchedulesCalendar(
    dateRange.start,
    dateRange.end,
    undefined,
    true // includeCancelledWithBookings = true
  )
  const { data: classesData } = useClasses()
  const { data: bookingsData, isLoading: bookingsLoading } = useBookingsForSchedule(selectedScheduleId || 0)
  const cancelBookingMutation = useCancelBookingByOrganizer()
  const markAttendanceMutation = useMarkAttendance()
  const updateNotesMutation = useUpdateBookingNotes()

  // Get schedules and classes
  // useSchedulesCalendar returns ClassSchedule[] directly, not an object with schedules property
  const schedules = useMemo(() => (Array.isArray(schedulesData) ? schedulesData : []), [schedulesData])
  const classes = classesData || []
  const bookings = useMemo(() => bookingsData?.bookings || [], [bookingsData?.bookings])

  // Filter schedules by class and only show schedules with bookings
  const filteredSchedules = useMemo(() => {
    let filtered = schedules

    // Filter by class
    if (selectedClassId !== 'all') {
      filtered = filtered.filter((s: ClassSchedule) => s.class?.id === parseInt(selectedClassId))
    }

    // Only show schedules with at least one booking (booked or waitlisted)
    filtered = filtered.filter((s: ClassSchedule) => {
      const booked = s.bookingCounts?.booked || 0
      const waitlisted = s.bookingCounts?.waitlisted || 0
      return booked + waitlisted > 0
    })

    return filtered
  }, [schedules, selectedClassId])

  // Auto-select first schedule if none selected and schedules are available
  useEffect(() => {
    if (!selectedScheduleId && filteredSchedules.length > 0) {
      setSelectedScheduleId(filteredSchedules[0].id)
    }
  }, [filteredSchedules, selectedScheduleId])

  // Filter bookings
  const filteredBookings = useMemo(() => {
    let filtered = bookings

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((b: Booking) => b.status === statusFilter)
    }

    // Filter by search query (participant name or username)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((b: Booking) => {
        const firstName = b.participant?.appUser?.authUser?.firstName?.toLowerCase() || ''
        const lastName = b.participant?.appUser?.authUser?.lastName?.toLowerCase() || ''
        const combinedName = firstName && lastName ? `${firstName} ${lastName}`.toLowerCase() : ''
        const username = b.participant?.appUser?.authUser?.username?.toLowerCase() || ''
        return (
          combinedName.includes(query) ||
          firstName.includes(query) ||
          lastName.includes(query) ||
          username.includes(query)
        )
      })
    }

    // Sort: Booked first, then Waitlisted, then others
    return filtered.sort((a: Booking, b: Booking) => {
      if (a.status === BOOKING_STATUS.BOOKED && b.status !== BOOKING_STATUS.BOOKED) return -1
      if (a.status !== BOOKING_STATUS.BOOKED && b.status === BOOKING_STATUS.BOOKED) return 1
      if (a.status === BOOKING_STATUS.WAITLISTED && b.status !== BOOKING_STATUS.WAITLISTED) return -1
      if (a.status !== BOOKING_STATUS.WAITLISTED && b.status === BOOKING_STATUS.WAITLISTED) return 1
      return 0
    })
  }, [bookings, statusFilter, searchQuery])

  // Handlers
  const handleUpdateNotes = async (bookingId: number, notes: string) => {
    try {
      await updateNotesMutation.mutateAsync({ id: bookingId, organizerNotes: notes })
      addNotification({ message: 'Notes updated successfully', type: 'success' })
      // Update the selected booking in the dialog to show the new notes immediately
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, organizerNotes: notes })
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update notes'
      addNotification({ message: errorMessage, type: 'error' })
    }
  }

  const handleCancelBooking = async (bookingId: number, reason?: string) => {
    try {
      await cancelBookingMutation.mutateAsync({ id: bookingId, cancelReason: reason })
      addNotification({ message: 'Booking cancelled successfully', type: 'success' })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel booking'
      addNotification({ message: errorMessage, type: 'error' })
    }
  }

  const handleToggleAttendance = async (bookingId: number, attended: boolean) => {
    try {
      await markAttendanceMutation.mutateAsync({
        bookingIds: [bookingId],
        status: attended ? 'ATTENDED' : 'NO_SHOW',
      })
      addNotification({ message: attended ? 'Marked as attended' : 'Marked as no-show', type: 'success' })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update attendance'
      addNotification({ message: errorMessage, type: 'error' })
    }
  }

  if (schedulesLoading) {
    return <BookingsSkeleton />
  }

  return (
    <ContainerTemplate>
      <BackButton />

      <div className="space-y-6 mt-4">
        {/* Header */}
        <div>
          <h1>Class Bookings</h1>
          <p className="text-foreground-muted mt-1">View and manage bookings for your classes</p>
        </div>

        {/* Schedule Selection */}
        <ScheduleSelector
          schedules={filteredSchedules}
          classes={classes}
          selectedScheduleId={selectedScheduleId}
          selectedClassId={selectedClassId}
          dateRange={dateRange}
          onScheduleSelect={setSelectedScheduleId}
          onClassFilterChange={setSelectedClassId}
          onDateRangeChange={setDateRange}
        />

        {/* Bookings List - Show when a schedule is selected */}
        {selectedScheduleId ? (
          bookingsData ? (
            <BookingsList
              bookings={filteredBookings}
              isLoading={bookingsLoading}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              onViewDetails={setSelectedBooking}
              onToggleAttendance={handleToggleAttendance}
              isMarkingAttendance={markAttendanceMutation.isPending}
              onSearchChange={setSearchQuery}
              onStatusFilterChange={setStatusFilter}
            />
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-foreground-muted">
                  <p>Loading bookings...</p>
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-foreground-muted">
                <p>Select a schedule above to view bookings</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Detail Dialog */}
        <BookingDetailDialog
          booking={selectedBooking}
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdateNotes={handleUpdateNotes}
          onCancel={handleCancelBooking}
        />
      </div>
    </ContainerTemplate>
  )
}
