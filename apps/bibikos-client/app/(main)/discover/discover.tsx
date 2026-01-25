'use client'

import { useNotifications } from '@js-monorepo/notification'
import { ContainerTemplate } from '@js-monorepo/templates'
import { useDeviceStore } from '../../../stores/deviceStore'
import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getDateGroup, toScheduleDisplayTimes, type DateGroup } from '../../../lib/datetime'
import type { DiscoverFilters as DiscoverFiltersType, DiscoverSchedule } from '../../../lib/scheduling'
import { useCancelBooking, useDiscoverSchedules } from '../../../lib/scheduling'
import {
  BookingDialog,
  CancelBookingDialog,
  DiscoverDateGroup,
  DiscoverEmptyState,
  DiscoverFilters,
  DiscoverSkeleton,
} from './components'
import { BookingDrawer } from './components/booking-dialog'
import { CancelBookingDrawer } from './components/cancel-booking-dialog'

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
    // Convert UTC time to schedule's local timezone for date grouping
    const { start } = toScheduleDisplayTimes(schedule)
    const group: DateGroup = getDateGroup(start.date)
    groups[group].push(schedule)
  }

  return groups
}

export default function DiscoverComponent() {
  const [filters, setFilters] = useState<DiscoverFiltersType>(getDefaultFilters)
  const [selectedSchedule, setSelectedSchedule] = useState<DiscoverSchedule | null>(null)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [scheduleToCancel, setScheduleToCancel] = useState<DiscoverSchedule | null>(null)
  const isMobile = useDeviceStore((state) => state.isMobile)
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

  const hasActiveFilters = Boolean(filters.tagIds?.length || filters.timeOfDay || filters.search)

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
      ) : schedules.length === 0 ? (
        <DiscoverEmptyState hasFilters={hasActiveFilters} onClearFilters={handleClearFilters} />
      ) : (
        <div className="space-y-8">
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

      {selectedSchedule &&
        (isMobile ? (
          <BookingDrawer schedule={selectedSchedule} open={bookingDialogOpen} onOpenChange={setBookingDialogOpen} />
        ) : (
          <BookingDialog schedule={selectedSchedule} open={bookingDialogOpen} onOpenChange={setBookingDialogOpen} />
        ))}

      {scheduleToCancel &&
        (isMobile ? (
          <CancelBookingDrawer
            schedule={scheduleToCancel}
            open={cancelDialogOpen}
            onOpenChange={setCancelDialogOpen}
            onConfirm={handleCancelConfirm}
            isLoading={cancelBookingMutation.isPending}
          />
        ) : (
          <CancelBookingDialog
            schedule={scheduleToCancel}
            open={cancelDialogOpen}
            onOpenChange={setCancelDialogOpen}
            onConfirm={handleCancelConfirm}
            isLoading={cancelBookingMutation.isPending}
          />
        ))}
      {/* Cancel Booking Dialog */}
    </ContainerTemplate>
  )
}
