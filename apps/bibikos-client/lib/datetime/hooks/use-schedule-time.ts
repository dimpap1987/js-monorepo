'use client'

import { useMemo } from 'react'
import type { ScheduleTimeData, UseScheduleTimeResult } from '../types'
import { toScheduleDisplayTimes, getTimezoneAbbreviation } from '../utils/timezone'
import { formatTimeRange, formatScheduleDate, formatFullDate } from '../utils/format'
import { useDateTimeContext } from './use-datetime-context'

/**
 * Hook for displaying schedule times in the schedule's local timezone
 *
 * This is the primary hook for all schedule display across the app.
 * Times are shown in the timezone where the class takes place.
 *
 * @example
 * ```typescript
 * // In a schedule card component:
 * function ScheduleCard({ schedule }) {
 *   const { times, timeRange, dateParts, fullDate } = useScheduleTime(schedule)
 *
 *   return (
 *     <div>
 *       <DateBadge month={dateParts.month} day={dateParts.day} />
 *       <p>{fullDate}</p>
 *       <p>{timeRange}</p> // "10:00 AM - 11:00 AM"
 *     </div>
 *   )
 * }
 * ```
 *
 * @param schedule - Schedule data with UTC times and local timezone
 * @returns Schedule time display data
 */
export function useScheduleTime(schedule: ScheduleTimeData | null | undefined): UseScheduleTimeResult {
  const { dateLocale } = useDateTimeContext()

  return useMemo(() => {
    // Default empty result for null/undefined schedules
    if (!schedule) {
      const now = new Date()
      return {
        times: {
          start: { date: now, utc: '', timezone: 'UTC' },
          end: { date: now, utc: '', timezone: 'UTC' },
        },
        timeRange: '',
        dateParts: { month: '', day: '', dayOfWeek: '' },
        fullDate: '',
        timezone: 'UTC',
        timezoneAbbr: 'UTC',
      }
    }

    const times = toScheduleDisplayTimes(schedule)
    const { start, end } = times

    return {
      times,
      timeRange: formatTimeRange(start.date, end.date, dateLocale),
      dateParts: formatScheduleDate(start.date, dateLocale),
      fullDate: formatFullDate(start.date, dateLocale),
      timezone: start.timezone,
      timezoneAbbr: getTimezoneAbbreviation(start.timezone, start.date),
    }
  }, [schedule, dateLocale])
}

/**
 * Hook for displaying schedule times using multiple schedules
 * Returns the timezone info from the first schedule
 *
 * Useful when you need timezone info but don't need individual schedule times
 */
export function useScheduleTimezone(schedules: ScheduleTimeData[] | null | undefined): {
  timezone: string
  timezoneAbbr: string
} {
  return useMemo(() => {
    if (!schedules || schedules.length === 0) {
      return { timezone: 'UTC', timezoneAbbr: 'UTC' }
    }

    const firstSchedule = schedules[0]
    const timezone = firstSchedule.localTimezone
    const date = new Date() // Use current date for abbreviation

    return {
      timezone,
      timezoneAbbr: getTimezoneAbbreviation(timezone, date),
    }
  }, [schedules])
}
