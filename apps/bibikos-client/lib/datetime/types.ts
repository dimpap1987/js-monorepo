import type { Locale as DateFnsLocale } from 'date-fns'

/**
 * IANA timezone identifier (e.g., 'Europe/Athens', 'America/New_York')
 */
export type IANATimezone = string

/**
 * UTC datetime string in ISO 8601 format (e.g., '2024-01-15T10:00:00.000Z')
 */
export type UTCDateTimeString = string

/**
 * Minimal schedule time data required for timezone conversion
 */
export interface ScheduleTimeData {
  id: number
  startTimeUtc: UTCDateTimeString
  endTimeUtc: UTCDateTimeString
  localTimezone: IANATimezone
}

/**
 * Converted display times for a schedule
 */
export interface ScheduleDisplayTimes {
  start: {
    date: Date
    utc: string
    timezone: string
  }
  end: {
    date: Date
    utc: string
    timezone: string
  }
}

/**
 * Date parts for schedule badges/cards
 */
export interface ScheduleDateParts {
  /** Short month name (e.g., "Jan", "Ιαν") */
  month: string
  /** Day of month (e.g., "15") */
  day: string
  /** Short day of week (e.g., "Mon", "Δευ") */
  dayOfWeek: string
}

/**
 * Date grouping category for schedule lists
 */
export type DateGroup = 'today' | 'tomorrow' | 'thisWeek' | 'later'

/**
 * Combined datetime context
 */
export interface DateTimeContext {
  /** User's preferred timezone from session */
  userTimezone: IANATimezone
  /** Browser's detected timezone */
  browserTimezone: IANATimezone
  /** date-fns locale for formatting */
  dateLocale: DateFnsLocale
  /** App locale code (e.g., 'en', 'el') */
  appLocale: string
}

/**
 * Schedule time hook return type
 */
export interface UseScheduleTimeResult {
  /** Converted times in schedule's local timezone */
  times: ScheduleDisplayTimes
  /** Formatted time range string (e.g., "10:00 AM - 11:00 AM") */
  timeRange: string
  /** Date parts for badges */
  dateParts: ScheduleDateParts
  /** Full formatted date string */
  fullDate: string
  /** Schedule's timezone */
  timezone: IANATimezone
  /** Timezone abbreviation (e.g., "EET", "EST") */
  timezoneAbbr: string
}
