'use client'

import { DateSelectArg, DatesSetArg, EventClickArg } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { useDeviceType } from '@js-monorepo/next/hooks'
import { format, startOfDay } from 'date-fns'
import { AlertCircle, Users } from 'lucide-react'
import { useCallback, useMemo, useRef } from 'react'
import { ClassSchedule } from '../../../../../lib/scheduling'
import { CalendarEvent, CapacityStatus } from '../types'

// Import the dedicated calendar styles
import '../calendar.css'

export interface DateSelection {
  startDate: string
  endDate: string
  startTime: string
  isRange: boolean
}

interface CalendarViewProps {
  events: CalendarEvent[]
  onDatesSet: (start: string, end: string) => void
  onEventClick: (schedule: ClassSchedule) => void
  onDateSelect: (selection: DateSelection) => void
  selectable: boolean
  isLoading?: boolean
}

// Capacity status indicator component
function CapacityIndicator({
  status,
  booked,
  capacity,
}: {
  status: CapacityStatus
  booked: number
  capacity?: number
}) {
  if (status === 'full') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1 py-0.5 rounded bg-white/20">
        <AlertCircle className="w-2.5 h-2.5" />
        FULL
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-0.5 opacity-90">
      <Users className="w-3 h-3" />
      <span className="text-[11px]">
        {booked}
        {capacity && `/${capacity}`}
      </span>
    </span>
  )
}

export function CalendarView({
  events,
  onDatesSet,
  onEventClick,
  onDateSelect,
  selectable,
  isLoading,
}: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null)
  const { deviceType } = useDeviceType()
  const isMobile = deviceType === 'mobile'
  const isTablet = deviceType === 'tablet'

  // Get today's date at start of day to disable previous dates
  const todayStart = useMemo(() => startOfDay(new Date()), [])

  // Determine initial view based on device type
  const initialView = useMemo(() => {
    if (isMobile) return 'listWeek'
    if (isTablet) return 'timeGridWeek'
    return 'dayGridMonth'
  }, [isMobile, isTablet])

  // Responsive header toolbar
  const headerToolbar = useMemo(() => {
    if (isMobile) {
      return {
        left: 'prev,next',
        center: 'title',
        right: 'today',
      }
    }
    if (isTablet) {
      return {
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridWeek,listWeek',
      }
    }
    return {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listWeek',
    }
  }, [isMobile, isTablet])

  const handleDatesSet = useCallback(
    (arg: DatesSetArg) => {
      onDatesSet(format(arg.start, 'yyyy-MM-dd'), format(arg.end, 'yyyy-MM-dd'))
    },
    [onDatesSet]
  )

  const handleEventClick = useCallback(
    (arg: EventClickArg) => {
      const schedule = arg.event.extendedProps.schedule as ClassSchedule
      onEventClick(schedule)
    },
    [onEventClick]
  )

  const handleDateSelect = useCallback(
    (arg: DateSelectArg) => {
      // Only allow selection of today and future dates
      const selectedDate = startOfDay(arg.start)
      if (selectedDate >= todayStart) {
        const startDateStr = format(arg.start, 'yyyy-MM-dd')
        const viewType = arg.view.type

        // In timeGrid views, the end date represents the actual time range selection
        // In dayGrid views, the end date is exclusive (next day) so we subtract 1 day
        const isDayGridView = viewType.startsWith('dayGrid')
        let endDateStr: string

        if (isDayGridView) {
          // FullCalendar dayGrid end date is exclusive, subtract 1 day for actual end
          const actualEndDate = new Date(arg.end)
          actualEndDate.setDate(actualEndDate.getDate() - 1)
          endDateStr = format(actualEndDate, 'yyyy-MM-dd')
        } else {
          // timeGrid views: use start date (same day selection)
          endDateStr = startDateStr
        }

        const isRange = startDateStr !== endDateStr

        onDateSelect({
          startDate: startDateStr,
          endDate: endDateStr,
          startTime: format(arg.start, 'HH:mm'),
          isRange,
        })
      }
    },
    [onDateSelect, todayStart]
  )

  // Custom event content renderer
  const renderEventContent = useCallback(
    (arg: { event: { title: string; extendedProps: CalendarEvent['extendedProps'] }; view: { type: string } }) => {
      const { bookingCounts, schedule, capacityStatus } = arg.event.extendedProps
      const viewType = arg.view.type
      const isCancelled = schedule?.isCancelled

      // List view rendering
      if (viewType === 'listWeek') {
        return (
          <div className="flex items-center justify-between gap-3 w-full">
            <span className={`font-medium ${isCancelled ? 'line-through opacity-60' : ''}`}>{arg.event.title}</span>
            {bookingCounts && !isCancelled && (
              <CapacityIndicator
                status={capacityStatus || 'normal'}
                booked={bookingCounts.booked}
                capacity={schedule?.class?.capacity ?? undefined}
              />
            )}
            {isCancelled && (
              <span className="text-xs px-2 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
                Cancelled
              </span>
            )}
          </div>
        )
      }

      // Time grid view rendering (week/day)
      if (viewType === 'timeGridWeek' || viewType === 'timeGridDay') {
        return (
          <div className="flex flex-col gap-0.5 p-1 h-full overflow-hidden">
            <div className={`font-semibold text-xs truncate ${isCancelled ? 'line-through' : ''}`}>
              {arg.event.title}
            </div>
            {bookingCounts && !isCancelled && !isMobile && (
              <CapacityIndicator
                status={capacityStatus || 'normal'}
                booked={bookingCounts.booked}
                capacity={schedule?.class?.capacity ?? undefined}
              />
            )}
          </div>
        )
      }

      // Day grid view rendering (month)
      return (
        <div className={`${isMobile ? 'p-0.5' : 'px-1.5 py-1'} overflow-hidden`}>
          <div
            className={`font-medium ${isMobile ? 'text-[10px]' : 'text-xs'} truncate ${isCancelled ? 'line-through' : ''}`}
          >
            {arg.event.title}
          </div>
          {bookingCounts && !isMobile && !isCancelled && (
            <CapacityIndicator
              status={capacityStatus || 'normal'}
              booked={bookingCounts.booked}
              capacity={schedule?.class?.capacity ?? undefined}
            />
          )}
        </div>
      )
    },
    [isMobile]
  )

  return (
    <Card className="border-border/50 overflow-hidden shadow-sm">
      <CardContent className={isMobile ? 'p-2' : 'p-4 sm:p-6'}>
        <div className={`fc-custom-styles ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
          <FullCalendar
            ref={calendarRef}
            eventClassNames={(arg) => {
              const now = new Date()
              const eventStart = arg.event.start // could be null
              const eventEnd = arg.event.end || eventStart // fallback to start if end is missing

              if (eventEnd && eventEnd < now) return ['fc-event-past'] // finished events

              if (eventStart && eventEnd && eventStart <= now && eventEnd >= now) {
                return ['fc-event-ongoing'] // currently happening
              }
              return []
            }}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView={initialView}
            headerToolbar={headerToolbar}
            events={events}
            datesSet={handleDatesSet}
            eventClick={handleEventClick}
            selectable={selectable}
            select={handleDateSelect}
            selectConstraint={{ start: todayStart }}
            height="auto"
            contentHeight="auto"
            aspectRatio={isMobile ? 1.2 : 1.8}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short',
            }}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            slotDuration="00:30:00"
            slotLabelInterval="01:00:00"
            allDaySlot={false}
            weekends={true}
            nowIndicator={true}
            eventDisplay="block"
            dayMaxEvents={isMobile ? 2 : 4}
            moreLinkClick="popover"
            eventContent={renderEventContent}
            // Improved interaction settings
            selectMirror={true}
            unselectAuto={true}
            selectOverlap={true}
            // Better navigation
            navLinks={true}
            navLinkDayClick="timeGridDay"
            // Accessibility
            buttonText={{
              today: 'Today',
              month: 'Month',
              week: 'Week',
              day: 'Day',
              list: 'List',
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
