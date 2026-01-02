export const DATE_CONFIG = {
  /** Storage timezone - ALWAYS UTC for database and server */
  SERVER_TIMEZONE: 'UTC',

  /** Default timezone for users who haven't set a preference */
  DEFAULT_USER_TIMEZONE: 'UTC',

  /** Common date formats */
  FORMATS: {
    /** ISO 8601 for API responses */
    ISO: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
    /** Date only */
    DATE: 'yyyy-MM-dd',
    /** Time only */
    TIME: 'HH:mm:ss',
    /** Human readable */
    DISPLAY: 'MMM d, yyyy h:mm a',
    /** Full datetime */
    FULL: 'yyyy-MM-dd HH:mm:ss',
    /** Relative display */
    RELATIVE: 'PPpp',
  },
} as const

/** Common timezone identifiers */
export const TIMEZONES = {
  // Americas
  US_EASTERN: 'America/New_York',
  US_CENTRAL: 'America/Chicago',
  US_MOUNTAIN: 'America/Denver',
  US_PACIFIC: 'America/Los_Angeles',
  US_ALASKA: 'America/Anchorage',
  US_HAWAII: 'America/Adak',
  CANADA_EASTERN: 'America/Toronto',
  CANADA_PACIFIC: 'America/Vancouver',
  BRAZIL_SAO_PAULO: 'America/Sao_Paulo',
  ARGENTINA: 'America/Argentina/Buenos_Aires',
  MEXICO_CITY: 'America/Mexico_City',

  // Europe
  UK: 'Europe/London',
  WESTERN_EUROPE: 'Europe/Lisbon',
  CENTRAL_EUROPE: 'Europe/Paris', // Covers Berlin, Rome, Madrid, etc.
  EASTERN_EUROPE: 'Europe/Bucharest',
  GREECE: 'Europe/Athens',
  TURKEY: 'Europe/Istanbul',
  RUSSIA_MOSCOW: 'Europe/Moscow',

  // Asia
  DUBAI: 'Asia/Dubai',
  INDIA: 'Asia/Kolkata',
  BANGKOK: 'Asia/Bangkok',
  SINGAPORE: 'Asia/Singapore',
  HONG_KONG: 'Asia/Hong_Kong',
  SHANGHAI: 'Asia/Shanghai',
  TOKYO: 'Asia/Tokyo',
  SEOUL: 'Asia/Seoul',

  // Australia / Oceania
  AUSTRALIA_SYDNEY: 'Australia/Sydney',
  AUSTRALIA_PERTH: 'Australia/Perth',
  AUSTRALIA_ADELAIDE: 'Australia/Adelaide',
  NEW_ZEALAND: 'Pacific/Auckland',

  // Africa
  EGYPT: 'Africa/Cairo',
  SOUTH_AFRICA: 'Africa/Johannesburg',
  NIGERIA: 'Africa/Lagos',
  KENYA: 'Africa/Nairobi',
} as const

export type TimezoneId = (typeof TIMEZONES)[keyof typeof TIMEZONES] | string
