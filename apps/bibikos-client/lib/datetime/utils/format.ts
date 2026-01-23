import { format, isToday, isTomorrow, isThisWeek } from 'date-fns'
import type { Locale as DateFnsLocale } from 'date-fns'
import type { ScheduleDateParts, DateGroup } from '../types'
import { DATE_FORMATS } from '../constants'

/**
 * Format a date with locale support
 *
 * Use this instead of raw date-fns format() to ensure consistent locale handling
 *
 * @example
 * ```typescript
 * const { dateLocale } = useDateTimeContext()
 * formatDate(date, DATE_FORMATS.DATE_FULL, dateLocale)
 * // "Monday, January 15, 2024" (en) or "Δευτέρα, 15 Ιανουαρίου 2024" (el)
 * ```
 */
export function formatDate(date: Date, pattern: string, locale: DateFnsLocale): string {
  return format(date, pattern, { locale })
}

/**
 * Format a time range (e.g., "10:00 AM - 11:00 AM")
 *
 * @example
 * ```typescript
 * formatTimeRange(startDate, endDate, dateLocale)
 * // "10:00 AM - 11:00 AM"
 * ```
 */
export function formatTimeRange(start: Date, end: Date, locale: DateFnsLocale): string {
  const startTime = format(start, DATE_FORMATS.TIME, { locale })
  const endTime = format(end, DATE_FORMATS.TIME, { locale })
  return `${startTime} - ${endTime}`
}

/**
 * Get date parts for schedule badges/cards
 *
 * @example
 * ```typescript
 * const parts = formatScheduleDate(date, dateLocale)
 * // { month: "Jan", day: "15", dayOfWeek: "Mon" }
 * ```
 */
export function formatScheduleDate(date: Date, locale: DateFnsLocale): ScheduleDateParts {
  return {
    month: format(date, DATE_FORMATS.MONTH_SHORT, { locale }),
    day: format(date, DATE_FORMATS.DAY_OF_MONTH, { locale }),
    dayOfWeek: format(date, DATE_FORMATS.DAY_OF_WEEK, { locale }),
  }
}

/**
 * Get the date group for sorting/categorizing schedules
 *
 * @example
 * ```typescript
 * const group = getDateGroup(scheduleDate)
 * // 'today' | 'tomorrow' | 'thisWeek' | 'later'
 * ```
 */
export function getDateGroup(date: Date): DateGroup {
  if (isToday(date)) return 'today'
  if (isTomorrow(date)) return 'tomorrow'
  if (isThisWeek(date)) return 'thisWeek'
  return 'later'
}

/**
 * Format a full date string (locale-aware)
 */
export function formatFullDate(date: Date, locale: DateFnsLocale): string {
  return format(date, DATE_FORMATS.DATE_FULL, { locale })
}

/**
 * Format date with time for dialogs/confirmations
 */
export function formatDateTime(date: Date, locale: DateFnsLocale): string {
  return format(date, DATE_FORMATS.DATE_TIME, { locale })
}

/**
 * Format date with day name and short month (for booking info)
 */
export function formatDateWithDay(date: Date, locale: DateFnsLocale): string {
  return format(date, DATE_FORMATS.DATE_WITH_DAY, { locale })
}

/**
 * Format medium date with day name (for booking cards)
 */
export function formatDateMediumWithDay(date: Date, locale: DateFnsLocale): string {
  return format(date, DATE_FORMATS.DATE_MEDIUM_WITH_DAY, { locale })
}
