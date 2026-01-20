import { useMemo } from 'react'
import { Class, ClassSchedule } from '../../../../../lib/scheduling'
import { CalendarEvent, CalendarEventClassNames } from '../types'

// Professional color palette using oklch values for better theme integration
const CLASS_COLOR_PALETTE = [
  { name: 'blue', bg: 'oklch(0.6 0.2 250)', border: 'oklch(0.5 0.25 250)' },
  { name: 'green', bg: 'oklch(0.65 0.18 150)', border: 'oklch(0.55 0.22 150)' },
  { name: 'purple', bg: 'oklch(0.6 0.2 300)', border: 'oklch(0.5 0.25 300)' },
  { name: 'amber', bg: 'oklch(0.75 0.18 80)', border: 'oklch(0.65 0.22 80)' },
  { name: 'rose', bg: 'oklch(0.65 0.2 15)', border: 'oklch(0.55 0.25 15)' },
  { name: 'cyan', bg: 'oklch(0.7 0.15 200)', border: 'oklch(0.6 0.2 200)' },
  { name: 'orange', bg: 'oklch(0.7 0.18 50)', border: 'oklch(0.6 0.22 50)' },
  { name: 'teal', bg: 'oklch(0.65 0.15 175)', border: 'oklch(0.55 0.2 175)' },
] as const

// Cancelled event colors
const CANCELLED_COLORS = {
  bg: 'oklch(0.6 0 0)',
  border: 'oklch(0.5 0 0)',
}

/**
 * Get a consistent color for a class based on its ID
 * This ensures the same class always has the same color
 */
function getClassColor(classId: number) {
  const colorIndex = classId % CLASS_COLOR_PALETTE.length
  return CLASS_COLOR_PALETTE[colorIndex]
}

/**
 * Determine capacity status for visual indicators
 */
function getCapacityStatus(
  bookingCounts: { booked: number; waitlisted?: number } | undefined,
  capacity: number | null | undefined
): 'normal' | 'near-capacity' | 'full' {
  if (!bookingCounts || !capacity) return 'normal'

  const utilization = bookingCounts.booked / capacity

  if (utilization >= 1) return 'full'
  if (utilization >= 0.8) return 'near-capacity'
  return 'normal'
}

/**
 * Build CSS class names for the event based on its state
 */
function buildEventClassNames(
  colorName: string,
  isCancelled: boolean,
  capacityStatus: 'normal' | 'near-capacity' | 'full'
): CalendarEventClassNames {
  const classNames: string[] = []

  if (isCancelled) {
    classNames.push('fc-event-cancelled')
  } else {
    classNames.push(`fc-event-${colorName}`)

    if (capacityStatus === 'near-capacity') {
      classNames.push('fc-event-near-capacity')
    } else if (capacityStatus === 'full') {
      classNames.push('fc-event-full')
    }
  }

  return classNames
}

export function useCalendarEvents(
  schedules: ClassSchedule[] | undefined,
  classes: Class[] | undefined
): CalendarEvent[] {
  return useMemo(() => {
    if (!schedules) return []

    return schedules.map((schedule) => {
      const classInfo = classes?.find((c) => c.id === schedule.classId)
      const isCancelled = schedule.isCancelled

      // Get consistent color for this class
      const color = isCancelled ? CANCELLED_COLORS : getClassColor(schedule.classId)

      // Determine capacity status
      const capacityStatus = getCapacityStatus(schedule.bookingCounts, classInfo?.capacity)

      // Build class names for styling
      const colorInfo = getClassColor(schedule.classId)
      const classNames = buildEventClassNames(colorInfo.name, isCancelled, capacityStatus)

      return {
        id: schedule.id.toString(),
        title: classInfo?.title || 'Class',
        start: schedule.startTimeUtc,
        end: schedule.endTimeUtc,
        backgroundColor: color.bg,
        borderColor: color.border,
        textColor: '#ffffff',
        classNames,
        extendedProps: {
          schedule,
          classInfo,
          bookingCounts: schedule.bookingCounts,
          colorName: colorInfo.name,
          capacityStatus,
        },
      }
    })
  }, [schedules, classes])
}

// Export for use in legend/filter components
export { CLASS_COLOR_PALETTE, getClassColor }
