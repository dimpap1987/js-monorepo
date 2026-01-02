import {
  addDays,
  addHours,
  addMinutes,
  endOfDay,
  formatDistanceToNow,
  isAfter,
  isBefore,
  isValid,
  parseISO,
  startOfDay,
} from 'date-fns'
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'
import { DATE_CONFIG, TimezoneId, TIMEZONES } from './constants'

/**
 * Get current UTC date
 */
export function nowUTC(): Date {
  return new Date()
}

/**
 * Get current timestamp in milliseconds (UTC)
 */
export function nowUTCTimestamp(): number {
  return Date.now()
}

/**
 * Convert a Date to ISO string (always UTC)
 */
export function toISOString(date: Date): string {
  return date.toISOString()
}

/**
 * Parse an ISO string to Date object
 */
export function fromISOString(isoString: string): Date {
  const date = parseISO(isoString)
  if (!isValid(date)) {
    throw new Error(`Invalid ISO date string: ${isoString}`)
  }
  return date
}

/**
 * Convert UTC date to user's timezone for display
 */
export function toUserTimezone(date: Date, userTimezone: TimezoneId): Date {
  return toZonedTime(date, userTimezone)
}

/**
 * Convert a date from user's timezone to UTC for storage
 */
export function formatForUser(
  date: Date | string | number,
  userTimezone: string,
  formatStr = DATE_CONFIG.FORMATS.RELATIVE
): string {
  return formatInTimeZone(new Date(date), userTimezone, formatStr)
}

/**
 * Format date in UTC (for logs, server-side operations)
 */
export function formatUTC(date: Date, formatStr: string = DATE_CONFIG.FORMATS.FULL): string {
  return formatInTimeZone(date, DATE_CONFIG.SERVER_TIMEZONE, formatStr)
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true })
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date): boolean {
  return isBefore(date, nowUTC())
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date): boolean {
  return isAfter(date, nowUTC())
}

/**
 * Add time to a date
 */
export const addTime = {
  minutes: (date: Date, amount: number) => addMinutes(date, amount),
  hours: (date: Date, amount: number) => addHours(date, amount),
  days: (date: Date, amount: number) => addDays(date, amount),
}

/**
 * Get start of day in UTC
 */
export function startOfDayUTC(date: Date): Date {
  return startOfDay(date)
}

/**
 * Get end of day in UTC
 */
export function endOfDayUTC(date: Date): Date {
  return endOfDay(date)
}

/**
 * Validate if a string is a valid timezone identifier
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

/**
 * Get list of all valid IANA timezone identifiers
 * Note: Requires Node.js 18+ or modern browsers
 */
export function getAllTimezones(): string[] {
  // TypeScript's Intl types may not include supportedValuesOf yet
  const intl = Intl as typeof Intl & {
    supportedValuesOf?: (key: string) => string[]
  }

  if (typeof intl.supportedValuesOf === 'function') {
    return intl.supportedValuesOf('timeZone')
  }

  const sortedZones = Array.from(new Set(['UTC', Object.values(TIMEZONES)]))

  return sortedZones as string[]
}
