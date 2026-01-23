/**
 * Standard date format patterns for consistent formatting across the app
 * Uses date-fns format tokens: https://date-fns.org/docs/format
 */
export const DATE_FORMATS = {
  /** Locale-aware time (e.g., "2:30 PM" or "14:30") */
  TIME: 'p',

  /** Short date (e.g., "Jan 15") */
  DATE_SHORT: 'MMM d',

  /** Medium date (e.g., "Jan 15, 2024") */
  DATE_MEDIUM: 'MMM d, yyyy',

  /** Full date (e.g., "Monday, January 15, 2024") */
  DATE_FULL: 'EEEE, MMMM d, yyyy',

  /** Short month name (e.g., "Jan") */
  MONTH_SHORT: 'MMM',

  /** Day of month (e.g., "15") */
  DAY_OF_MONTH: 'd',

  /** Short day of week (e.g., "Mon") */
  DAY_OF_WEEK: 'EEE',

  /** Full day of week (e.g., "Monday") */
  DAY_OF_WEEK_FULL: 'EEEE',

  /** ISO date (e.g., "2024-01-15") */
  ISO_DATE: 'yyyy-MM-dd',

  /** Date with time (e.g., "EEEE, MMMM d, yyyy • h:mm a") */
  DATE_TIME: "EEEE, MMMM d, yyyy '•' p",

  /** Date with day and short month (e.g., "EEEE, MMM d") */
  DATE_WITH_DAY: 'EEEE, MMM d',

  /** Medium date with day (e.g., "EEEE, MMM d, yyyy") */
  DATE_MEDIUM_WITH_DAY: 'EEEE, MMM d, yyyy',
} as const

export type DateFormatKey = keyof typeof DATE_FORMATS

/**
 * Default timezone to use when none is available
 */
export const DEFAULT_TIMEZONE = 'UTC'

/**
 * Default locale code
 */
export const DEFAULT_LOCALE = 'en'
