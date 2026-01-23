import { parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import type { IANATimezone, ScheduleTimeData, ScheduleDisplayTimes } from '../types'
import { DEFAULT_TIMEZONE } from '../constants'

/**
 * Convert a UTC datetime string to a Date object in the specified timezone
 *
 * @param utcString - UTC datetime string in ISO format
 * @param timezone - IANA timezone identifier
 * @returns Date object representing the time in the specified timezone
 */
export function toTimezone(utcString: string, timezone: string): Date {
  const utcDate = parseISO(utcString)
  return toZonedTime(utcDate, timezone)
}

/**
 * Convert schedule times to display times in the schedule's local timezone
 *
 * This is the primary function for displaying schedule times.
 * Times are shown in the timezone where the class takes place,
 * regardless of the viewer's timezone.
 *
 * @example
 * ```typescript
 * const { start, end } = toScheduleDisplayTimes(schedule)
 * // start.date is a Date in schedule.localTimezone
 * // end.date is a Date in schedule.localTimezone
 * ```
 */
export function toScheduleDisplayTimes(schedule: ScheduleTimeData): ScheduleDisplayTimes {
  const timezone = schedule.localTimezone || DEFAULT_TIMEZONE

  return {
    start: {
      date: toTimezone(schedule.startTimeUtc, timezone),
      utc: schedule.startTimeUtc,
      timezone,
    },
    end: {
      date: toTimezone(schedule.endTimeUtc, timezone),
      utc: schedule.endTimeUtc,
      timezone,
    },
  }
}

/**
 * Convert schedule times to display times in the user's timezone
 *
 * Use this when you want to show the user what time a class
 * would be in their own timezone (less common use case).
 *
 * @example
 * ```typescript
 * const { start, end } = toUserDisplayTimes(schedule, 'America/New_York')
 * // start.date is a Date in user's timezone
 * ```
 */
export function toUserDisplayTimes(schedule: ScheduleTimeData, userTimezone: IANATimezone): ScheduleDisplayTimes {
  return {
    start: {
      date: toTimezone(schedule.startTimeUtc, userTimezone),
      utc: schedule.startTimeUtc,
      timezone: userTimezone,
    },
    end: {
      date: toTimezone(schedule.endTimeUtc, userTimezone),
      utc: schedule.endTimeUtc,
      timezone: userTimezone,
    },
  }
}

/**
 * Get the timezone abbreviation for a given timezone and date
 *
 * @param timezone - IANA timezone identifier
 * @param date - Date to get abbreviation for (affects DST)
 * @returns Timezone abbreviation (e.g., "EET", "EST", "PDT")
 */
export function getTimezoneAbbreviation(timezone: string, date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'short',
    })

    const parts = formatter.formatToParts(date)
    const tzPart = parts.find((part) => part.type === 'timeZoneName')
    return tzPart?.value || timezone
  } catch {
    return timezone
  }
}

/**
 * Get the browser's detected timezone
 */
export function getBrowserTimezone(): IANATimezone {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return DEFAULT_TIMEZONE
  }
}
