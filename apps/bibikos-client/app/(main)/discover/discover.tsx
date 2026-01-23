'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { isToday, isTomorrow, isThisWeek, parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { useNotifications } from '@js-monorepo/notification'
import { Loader2 } from 'lucide-react'
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
import { ContainerTemplate } from '@js-monorepo/templates'

function getDefaultFilters(): DiscoverFiltersType {
  return {}
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
    // Parse UTC time and convert to schedule's local timezone for date grouping
    const utcDate = parseISO(schedule.startTimeUtc)
    const localDate = toZonedTime(utcDate, schedule.localTimezone)
    console.log(localDate)

    if (isToday(localDate)) {
      groups.today.push(schedule)
    } else if (isTomorrow(localDate)) {
      groups.tomorrow.push(schedule)
    } else if (isThisWeek(localDate)) {
      groups.thisWeek.push(schedule)
    } else {
      groups.later.push(schedule)
    }
  }

  return groups
}

export default function DiscoverComponent() {
  const [filters, setFilters] = useState<DiscoverFiltersType>(getDefaultFilters)
  const [selectedSchedule, setSelectedSchedule] = useState<DiscoverSchedule | null>(null)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [scheduleToCancel, setScheduleToCancel] = useState<DiscoverSchedule | null>(null)

  const { addNotification } = useNotifications()
  const { data, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useDiscoverSchedules(filters)
  const cancelBookingMutation = useCancelBooking()

  // Flatten all pages into a single array of schedules
  const schedules = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap((page) => page.content)
  }, [data?.pages])

  const groupedSchedules = useMemo(() => {
    if (schedules.length === 0) return null
    return groupSchedulesByDate(schedules)
  }, [schedules])

  const hasActiveFilters = Boolean(filters.activity || filters.timeOfDay || filters.search)

  // Intersection observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  )

  useEffect(() => {
    const element = loadMoreRef.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [handleObserver])

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
    } catch (er: unknown) {
      addNotification({
        message: er instanceof Error ? er.message : 'Failed to cancel booking',
        type: 'error',
      })
    }
  }

  const totalSchedules = schedules.length

  return (
    <ContainerTemplate>
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
            {hasNextPage && ' (scroll for more)'}
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

          {/* Load more trigger / Loading indicator */}
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading more classes...</span>
              </div>
            )}
          </div>
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
    </ContainerTemplate>
  )
}
