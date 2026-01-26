'use client'

import { useNotifications } from '@js-monorepo/notification'
import { ContainerTemplate } from '@js-monorepo/templates'
import { useDeviceStore } from '../../../stores/deviceStore'
import { Loader2 } from 'lucide-react'
import { parseISO } from 'date-fns'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getDateGroup, type DateGroup } from '../../../lib/datetime'
import type {
  DiscoverFilters as DiscoverFiltersType,
  DiscoverClassGroup,
  DiscoverGroupedSchedule,
  DiscoverSchedule,
} from '../../../lib/scheduling'
import { useCancelBooking, useDiscoverSchedulesGrouped } from '../../../lib/scheduling'
import {
  BookingDialog,
  CancelBookingDialog,
  DiscoverDateGroup,
  DiscoverEmptyState,
  DiscoverFilters,
  DiscoverSkeleton,
  TimeSlotPicker,
} from './components'
import { BookingDrawer } from './components/booking-dialog'
import { CancelBookingDrawer } from './components/cancel-booking-dialog'
import type { GroupedByDate, TimeSlotPickerState } from './types'

function getDefaultFilters(): DiscoverFiltersType {
  return {}
}

/**
 * Groups class groups by date category (today, tomorrow, thisWeek, later)
 */
function groupByDateCategory(groups: DiscoverClassGroup[]): GroupedByDate {
  const result: GroupedByDate = {
    today: [],
    tomorrow: [],
    thisWeek: [],
    later: [],
  }

  for (const group of groups) {
    // Parse the date from the group (YYYY-MM-DD in local timezone)
    // We need to get the date group based on the first schedule's start time
    if (group.schedules.length === 0) continue

    const firstSchedule = group.schedules[0]
    const startDate = parseISO(firstSchedule.startTimeUtc)
    const dateGroup: DateGroup = getDateGroup(startDate)
    result[dateGroup].push(group)
  }

  return result
}

/**
 * Creates a synthetic DiscoverSchedule object for use with existing booking dialogs
 */
function createScheduleForBooking(group: DiscoverClassGroup, schedule: DiscoverGroupedSchedule): DiscoverSchedule {
  return {
    id: schedule.id,
    classId: group.classId,
    startTimeUtc: schedule.startTimeUtc,
    endTimeUtc: schedule.endTimeUtc,
    localTimezone: schedule.localTimezone,
    recurrenceRule: null,
    occurrenceDate: null,
    parentScheduleId: null,
    isCancelled: false,
    cancelledAt: null,
    cancelReason: null,
    createdAt: schedule.startTimeUtc,
    class: {
      id: group.classId,
      title: group.title,
      capacity: group.capacity,
      waitlistLimit: group.waitlistLimit,
      isCapacitySoft: false,
      location: group.location ?? undefined,
    },
    bookingCounts: schedule.bookingCounts,
    organizer: group.organizer,
    tags: group.tags,
    myBooking: schedule.myBooking,
  }
}

export default function DiscoverComponent() {
  const [filters, setFilters] = useState<DiscoverFiltersType>(getDefaultFilters)
  const [selectedSchedule, setSelectedSchedule] = useState<DiscoverSchedule | null>(null)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [scheduleToCancel, setScheduleToCancel] = useState<DiscoverSchedule | null>(null)
  const [timeSlotPicker, setTimeSlotPicker] = useState<TimeSlotPickerState>({
    isOpen: false,
    group: null,
  })
  const isMobile = useDeviceStore((state) => state.isMobile)
  const { addNotification } = useNotifications()
  const { data, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useDiscoverSchedulesGrouped(filters)
  const cancelBookingMutation = useCancelBooking()

  // Flatten all pages into a single array of groups
  const groups = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap((page) => page.groups)
  }, [data?.pages])

  const groupedByDate = useMemo(() => {
    if (groups.length === 0) return null
    return groupByDateCategory(groups)
  }, [groups])

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

  const handleOpenTimeSlots = (group: DiscoverClassGroup) => {
    setTimeSlotPicker({ isOpen: true, group })
  }

  const handleBookFromGroup = (group: DiscoverClassGroup, schedule: DiscoverGroupedSchedule) => {
    const syntheticSchedule = createScheduleForBooking(group, schedule)
    setTimeSlotPicker({ isOpen: false, group: null })
    setSelectedSchedule(syntheticSchedule)
    setBookingDialogOpen(true)
  }

  const handleCancelFromGroup = (group: DiscoverClassGroup, schedule: DiscoverGroupedSchedule) => {
    const syntheticSchedule = createScheduleForBooking(group, schedule)
    setTimeSlotPicker({ isOpen: false, group: null })
    setScheduleToCancel(syntheticSchedule)
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
      ) : groups.length === 0 ? (
        <DiscoverEmptyState hasFilters={hasActiveFilters} onClearFilters={handleClearFilters} />
      ) : (
        <div className="space-y-8">
          {/* Grouped by date */}
          {groupedByDate && (
            <>
              <DiscoverDateGroup
                title="Today"
                groups={groupedByDate.today}
                onOpenTimeSlots={handleOpenTimeSlots}
                onBook={handleBookFromGroup}
                onCancel={handleCancelFromGroup}
              />
              <DiscoverDateGroup
                title="Tomorrow"
                groups={groupedByDate.tomorrow}
                onOpenTimeSlots={handleOpenTimeSlots}
                onBook={handleBookFromGroup}
                onCancel={handleCancelFromGroup}
              />
              <DiscoverDateGroup
                title="This Week"
                groups={groupedByDate.thisWeek}
                onOpenTimeSlots={handleOpenTimeSlots}
                onBook={handleBookFromGroup}
                onCancel={handleCancelFromGroup}
              />
              <DiscoverDateGroup
                title="Upcoming"
                groups={groupedByDate.later}
                onOpenTimeSlots={handleOpenTimeSlots}
                onBook={handleBookFromGroup}
                onCancel={handleCancelFromGroup}
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

      <TimeSlotPicker
        group={timeSlotPicker.group}
        open={timeSlotPicker.isOpen}
        onOpenChange={(open) => {
          if (!open) setTimeSlotPicker({ isOpen: false, group: null })
        }}
        onBook={(schedule) => {
          if (timeSlotPicker.group) {
            handleBookFromGroup(timeSlotPicker.group, schedule)
          }
        }}
        onCancel={(schedule) => {
          if (timeSlotPicker.group) {
            handleCancelFromGroup(timeSlotPicker.group, schedule)
          }
        }}
        isMobile={isMobile}
      />
    </ContainerTemplate>
  )
}
