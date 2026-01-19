'use client'

import { useState, useMemo } from 'react'
import { format, addDays, startOfDay, endOfDay, isToday, isTomorrow, isThisWeek, parseISO } from 'date-fns'
import { useNotifications } from '@js-monorepo/notification'
import type { DiscoverSchedule, DiscoverFilters as DiscoverFiltersType } from '../../../lib/scheduling'
import { useDiscoverSchedules, useCancelBooking } from '../../../lib/scheduling'
import {
  DiscoverFilters,
  DiscoverDateGroup,
  DiscoverSkeleton,
  DiscoverEmptyState,
  BookingDialog,
  CancelBookingDialog,
} from './components'

function getDefaultFilters(): DiscoverFiltersType {
  const today = startOfDay(new Date())
  const twoWeeksLater = endOfDay(addDays(today, 14))

  return {
    startDate: format(today, 'yyyy-MM-dd'),
    endDate: format(twoWeeksLater, 'yyyy-MM-dd'),
  }
}

interface GroupedSchedules {
  today: DiscoverSchedule[]
  tomorrow: DiscoverSchedule[]
  thisWeek: DiscoverSchedule[]
  later: DiscoverSchedule[]
}

function groupSchedulesByDate(schedules: DiscoverSchedule[]): GroupedSchedules {
  const groups: GroupedSchedules = {
    today: [],
    tomorrow: [],
    thisWeek: [],
    later: [],
  }

  for (const schedule of schedules) {
    const date = parseISO(schedule.startTimeUtc)

    if (isToday(date)) {
      groups.today.push(schedule)
    } else if (isTomorrow(date)) {
      groups.tomorrow.push(schedule)
    } else if (isThisWeek(date)) {
      groups.thisWeek.push(schedule)
    } else {
      groups.later.push(schedule)
    }
  }

  return groups
}

export default function DiscoverPage() {
  const [filters, setFilters] = useState<DiscoverFiltersType>(getDefaultFilters)
  const [selectedSchedule, setSelectedSchedule] = useState<DiscoverSchedule | null>(null)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [scheduleToCancel, setScheduleToCancel] = useState<DiscoverSchedule | null>(null)

  const { addNotification } = useNotifications()
  const { data: schedules, isLoading, error, refetch } = useDiscoverSchedules(filters)
  const cancelBookingMutation = useCancelBooking()

  const groupedSchedules = useMemo(() => {
    if (!schedules) return null
    return groupSchedulesByDate(schedules)
  }, [schedules])

  const hasActiveFilters = Boolean(filters.activity || filters.timeOfDay || filters.search)

  const handleFilterChange = (newFilters: Partial<DiscoverFiltersType>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const handleClearFilters = () => {
    setFilters(getDefaultFilters())
  }

  const handleBook = (schedule: DiscoverSchedule) => {
    setSelectedSchedule(schedule)
    setBookingDialogOpen(true)
  }

  const handleCancelRequest = (schedule: DiscoverSchedule) => {
    setScheduleToCancel(schedule)
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!scheduleToCancel?.myBooking) return

    try {
      await cancelBookingMutation.mutateAsync({ id: scheduleToCancel.myBooking.id })
      addNotification({
        message: 'Booking cancelled successfully',
        type: 'success',
      })
      setCancelDialogOpen(false)
      setScheduleToCancel(null)
      // Refetch to update the UI
      refetch()
    } catch (error: unknown) {
      addNotification({
        message: error instanceof Error ? error.message : 'Failed to cancel booking',
        type: 'error',
      })
    }
  }

  const totalSchedules = schedules?.length || 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Discover Classes</h1>
        <p className="text-muted-foreground">Find and book fitness classes from instructors near you</p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <DiscoverFilters filters={filters} onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} />
      </div>

      {/* Results */}
      {isLoading ? (
        <DiscoverSkeleton />
      ) : error ? (
        <div className="text-center py-12 text-destructive">
          <p>Failed to load classes. Please try again.</p>
        </div>
      ) : totalSchedules === 0 ? (
        <DiscoverEmptyState hasFilters={hasActiveFilters} onClearFilters={handleClearFilters} />
      ) : (
        <div className="space-y-8">
          {/* Results count */}
          <p className="text-sm text-muted-foreground">
            {totalSchedules} {totalSchedules === 1 ? 'class' : 'classes'} found
          </p>

          {/* Grouped schedules */}
          {groupedSchedules && (
            <>
              <DiscoverDateGroup
                title="Today"
                schedules={groupedSchedules.today}
                onBook={handleBook}
                onCancel={handleCancelRequest}
              />
              <DiscoverDateGroup
                title="Tomorrow"
                schedules={groupedSchedules.tomorrow}
                onBook={handleBook}
                onCancel={handleCancelRequest}
              />
              <DiscoverDateGroup
                title="This Week"
                schedules={groupedSchedules.thisWeek}
                onBook={handleBook}
                onCancel={handleCancelRequest}
              />
              <DiscoverDateGroup
                title="Upcoming"
                schedules={groupedSchedules.later}
                onBook={handleBook}
                onCancel={handleCancelRequest}
              />
            </>
          )}
        </div>
      )}

      {/* Booking Dialog */}
      <BookingDialog schedule={selectedSchedule} open={bookingDialogOpen} onOpenChange={setBookingDialogOpen} />

      {/* Cancel Booking Dialog */}
      <CancelBookingDialog
        schedule={scheduleToCancel}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelConfirm}
        isLoading={cancelBookingMutation.isPending}
      />
    </div>
  )
}
