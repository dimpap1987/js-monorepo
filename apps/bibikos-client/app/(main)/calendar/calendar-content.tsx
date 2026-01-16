'use client'

import { BackButton } from '@js-monorepo/back-arrow'
import { useNotifications } from '@js-monorepo/notification'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import {
  useSchedulesCalendar,
  useClasses,
  useLocations,
  useCreateSchedule,
  useCancelSchedule,
  useOrganizer,
  ClassSchedule,
  Class,
  Location,
} from '../../../lib/scheduling'
import { ScheduleFormData } from './schemas'
import { buildRecurrenceRule, calculateEndTime } from './utils/schedule-utils'
import { useCalendarEvents } from './hooks/use-calendar-events'
import { CalendarSkeleton } from './components/calendar-skeleton'
import { CalendarHeader } from './components/calendar-header'
import { CalendarNoClassesWarning } from './components/calendar-no-classes-warning'
import { CalendarView, DateSelection } from './components/calendar-view'
import { ScheduleForm } from './components/schedule-form'
import { ScheduleDetailSheet } from './components/schedule-detail-sheet'
import { CancelScheduleDialog } from './components/cancel-schedule-dialog'

export function CalendarContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addNotification } = useNotifications()

  // State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<ClassSchedule | null>(null)
  const [cancelScheduleId, setCancelScheduleId] = useState<number | null>(null)
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  })
  const [selectedDateRange, setSelectedDateRange] = useState<DateSelection | null>(null)

  // Class filtering state (null = show all)
  const [visibleClassIds, setVisibleClassIds] = useState<Set<number> | null>(null)

  // Check if user has organizer profile
  const { data: organizer, isLoading: isOrganizerLoading } = useOrganizer()

  // Fetch classes and locations
  const { data: classes, isLoading: isClassesLoading } = useClasses()
  const { data: locations } = useLocations()
  const {
    data: schedules,
    isLoading: isSchedulesLoading,
    refetch: refetchSchedules,
  } = useSchedulesCalendar(dateRange.start, dateRange.end)

  // Mutations
  const createScheduleMutation = useCreateSchedule()
  const cancelScheduleMutation = useCancelSchedule()

  // Calendar events
  const allCalendarEvents = useCalendarEvents(schedules, classes)

  // Filter events based on visible class IDs
  const calendarEvents = useMemo(() => {
    if (visibleClassIds === null) return allCalendarEvents
    return allCalendarEvents.filter((event) => visibleClassIds.has(event.extendedProps.schedule.classId))
  }, [allCalendarEvents, visibleClassIds])

  // Class filtering handlers
  const handleToggleClass = useCallback(
    (classId: number) => {
      setVisibleClassIds((prev): Set<number> | null => {
        // If showing all, create a set with all except the toggled one
        if (prev === null) {
          const allIds = new Set<number>(classes?.map((c: { id: number }) => c.id) || [])
          allIds.delete(classId)
          return allIds
        }

        // Toggle the class in the set
        const newSet = new Set<number>(prev)
        if (newSet.has(classId)) {
          newSet.delete(classId)
        } else {
          newSet.add(classId)
        }

        // If all are now visible, return null to indicate "show all"
        if (classes && newSet.size === classes.length) {
          return null
        }

        return newSet
      })
    },
    [classes]
  )

  const handleShowAllClasses = useCallback(() => {
    setVisibleClassIds(null)
  }, [])

  const handleHideAllClasses = useCallback(() => {
    setVisibleClassIds(new Set())
  }, [])

  // Redirect to onboarding if no organizer profile
  useEffect(() => {
    if (!isOrganizerLoading && !organizer) {
      router.push('/onboarding')
    }
  }, [isOrganizerLoading, organizer, router])

  // Check URL params for actions
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'new' && !isCreateDialogOpen) {
      setIsCreateDialogOpen(true)
      // Clean up URL by removing the query parameter (defer to avoid render conflicts)
      setTimeout(() => {
        router.replace('/calendar', { scroll: false })
      }, 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Handle URL scheduleId param
  useEffect(() => {
    const scheduleId = searchParams.get('scheduleId')
    if (scheduleId && schedules) {
      const schedule = schedules.find((s: ClassSchedule) => s.id === Number(scheduleId))
      if (schedule) {
        setSelectedSchedule(schedule)
      }
    }
  }, [searchParams, schedules])

  // Handle date range change
  const handleDatesSet = useCallback((start: string, end: string) => {
    setDateRange((prev) => {
      // Only update if the range actually changed to prevent infinite loops
      if (prev.start === start && prev.end === end) {
        return prev
      }
      return { start, end }
    })
  }, [])

  // Handle event click
  const handleEventClick = (schedule: ClassSchedule) => {
    setSelectedSchedule(schedule)
  }

  // Handle date select (for creating new schedule)
  const handleDateSelect = (selection: DateSelection) => {
    setSelectedDateRange(selection)
    setIsCreateDialogOpen(true)
  }

  // Close schedule detail
  const handleCloseDetail = () => {
    setSelectedSchedule(null)
    // Remove scheduleId from URL
    const url = new URL(window.location.href)
    url.searchParams.delete('scheduleId')
    router.replace(url.pathname + url.search)
  }

  // Submit new schedule
  const handleSubmit = async (data: ScheduleFormData) => {
    try {
      const startDateTime = new Date(`${data.date}T${data.startTime}`)
      const endDateTime = calculateEndTime(data.date, data.startTime, data.duration)
      const recurrenceRule = buildRecurrenceRule(data)

      const result = await createScheduleMutation.mutateAsync({
        classId: data.classId,
        startTimeUtc: startDateTime.toISOString(),
        endTimeUtc: endDateTime.toISOString(),
        recurrenceRule,
      })

      // Explicitly refetch calendar data
      await refetchSchedules()

      const count = Array.isArray(result) ? result.length : 1
      addNotification({
        message: count > 1 ? `${count} schedules created` : 'Schedule created',
        type: 'success',
      })
      setIsCreateDialogOpen(false)
      setSelectedDateRange(null)
    } catch (error: any) {
      addNotification({
        message: error?.message || 'Failed to create schedule',
        type: 'error',
      })
    }
  }

  // Cancel schedule
  const handleCancelSchedule = async () => {
    if (!cancelScheduleId) return

    try {
      await cancelScheduleMutation.mutateAsync({ id: cancelScheduleId })
      await refetchSchedules()
      addNotification({ message: 'Schedule cancelled', type: 'success' })
      setCancelScheduleId(null)
      setSelectedSchedule(null)
    } catch (error: any) {
      addNotification({
        message: error?.message || 'Failed to cancel schedule',
        type: 'error',
      })
    }
  }

  const isLoading = isOrganizerLoading || isClassesLoading
  const hasClasses = classes && classes.length > 0

  if (isLoading) {
    return <CalendarSkeleton />
  }

  if (!organizer) {
    return null
  }

  // Get initial class ID from URL
  const initialClassId = searchParams.get('classId') ? Number(searchParams.get('classId')) : undefined

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <BackButton href="/dashboard" className="mb-3" />
      <div className="space-y-4 sm:space-y-6">
        <CalendarHeader
          onAddClick={() => setIsCreateDialogOpen(true)}
          hasClasses={!!hasClasses}
          classes={classes || []}
          visibleClassIds={visibleClassIds}
          onToggleClass={handleToggleClass}
          onShowAllClasses={handleShowAllClasses}
          onHideAllClasses={handleHideAllClasses}
        />

        {!hasClasses && <CalendarNoClassesWarning />}

        {hasClasses && (
          <CalendarView
            events={calendarEvents}
            onDatesSet={handleDatesSet}
            onEventClick={handleEventClick}
            onDateSelect={handleDateSelect}
            selectable={true}
            isLoading={isSchedulesLoading}
          />
        )}
      </div>

      <ScheduleForm
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) setSelectedDateRange(null)
        }}
        classes={classes || []}
        locations={locations || []}
        onSubmit={handleSubmit}
        isSubmitting={createScheduleMutation.isPending}
        initialClassId={initialClassId}
        initialDateRange={selectedDateRange}
      />

      <ScheduleDetailSheet
        schedule={selectedSchedule}
        classInfo={selectedSchedule ? classes?.find((c: Class) => c.id === selectedSchedule.classId) : undefined}
        location={
          selectedSchedule
            ? locations?.find(
                (l: Location) => l.id === classes?.find((c: Class) => c.id === selectedSchedule.classId)?.locationId
              )
            : undefined
        }
        onCancel={() => selectedSchedule && setCancelScheduleId(selectedSchedule.id)}
        onClose={handleCloseDetail}
      />

      <CancelScheduleDialog
        open={!!cancelScheduleId}
        onOpenChange={(open) => !open && setCancelScheduleId(null)}
        onConfirm={handleCancelSchedule}
      />
    </div>
  )
}
