// Common timezones for scheduling
export const TIMEZONES = [
  { value: 'Europe/Athens', label: '(GMT+02:00) Athens' },
  { value: 'Europe/London', label: '(GMT+00:00) London' },
  { value: 'Europe/Paris', label: '(GMT+01:00) Paris' },
  { value: 'Europe/Berlin', label: '(GMT+01:00) Berlin' },
  { value: 'Europe/Rome', label: '(GMT+01:00) Rome' },
  { value: 'Europe/Madrid', label: '(GMT+01:00) Madrid' },
  { value: 'Europe/Amsterdam', label: '(GMT+01:00) Amsterdam' },
  { value: 'Europe/Brussels', label: '(GMT+01:00) Brussels' },
  { value: 'Europe/Zurich', label: '(GMT+01:00) Zurich' },
  { value: 'Europe/Vienna', label: '(GMT+01:00) Vienna' },
  { value: 'Europe/Stockholm', label: '(GMT+01:00) Stockholm' },
  { value: 'Europe/Oslo', label: '(GMT+01:00) Oslo' },
  { value: 'Europe/Copenhagen', label: '(GMT+01:00) Copenhagen' },
  { value: 'Europe/Helsinki', label: '(GMT+02:00) Helsinki' },
  { value: 'Europe/Bucharest', label: '(GMT+02:00) Bucharest' },
  { value: 'Europe/Sofia', label: '(GMT+02:00) Sofia' },
  { value: 'Europe/Warsaw', label: '(GMT+01:00) Warsaw' },
  { value: 'Europe/Prague', label: '(GMT+01:00) Prague' },
  { value: 'Europe/Budapest', label: '(GMT+01:00) Budapest' },
  { value: 'Europe/Dublin', label: '(GMT+00:00) Dublin' },
  { value: 'Europe/Lisbon', label: '(GMT+00:00) Lisbon' },
  { value: 'America/New_York', label: '(GMT-05:00) New York' },
  { value: 'America/Chicago', label: '(GMT-06:00) Chicago' },
  { value: 'America/Denver', label: '(GMT-07:00) Denver' },
  { value: 'America/Los_Angeles', label: '(GMT-08:00) Los Angeles' },
  { value: 'America/Toronto', label: '(GMT-05:00) Toronto' },
  { value: 'America/Vancouver', label: '(GMT-08:00) Vancouver' },
  { value: 'America/Sao_Paulo', label: '(GMT-03:00) Sao Paulo' },
  { value: 'America/Mexico_City', label: '(GMT-06:00) Mexico City' },
  { value: 'Asia/Dubai', label: '(GMT+04:00) Dubai' },
  { value: 'Asia/Singapore', label: '(GMT+08:00) Singapore' },
  { value: 'Asia/Hong_Kong', label: '(GMT+08:00) Hong Kong' },
  { value: 'Asia/Tokyo', label: '(GMT+09:00) Tokyo' },
  { value: 'Asia/Seoul', label: '(GMT+09:00) Seoul' },
  { value: 'Asia/Shanghai', label: '(GMT+08:00) Shanghai' },
  { value: 'Asia/Kolkata', label: '(GMT+05:30) Mumbai' },
  { value: 'Australia/Sydney', label: '(GMT+11:00) Sydney' },
  { value: 'Australia/Melbourne', label: '(GMT+11:00) Melbourne' },
  { value: 'Pacific/Auckland', label: '(GMT+13:00) Auckland' },
  { value: 'UTC', label: '(GMT+00:00) UTC' },
]

// Common countries for location selection
export const COUNTRIES = [
  { code: 'GR', name: 'Greece' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'PT', name: 'Portugal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'HU', name: 'Hungary' },
  { code: 'RO', name: 'Romania' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'MT', name: 'Malta' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
  { code: 'BR', name: 'Brazil' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'SG', name: 'Singapore' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'IN', name: 'India' },
  { code: 'IL', name: 'Israel' },
  { code: 'ZA', name: 'South Africa' },
]

// Greek cities (major cities in Greece)
export const GREEK_CITIES = [
  { value: 'Athens', label: 'Athens (Αθήνα)' },
  { value: 'Thessaloniki', label: 'Thessaloniki (Θεσσαλονίκη)' },
  { value: 'Patras', label: 'Patras (Πάτρα)' },
  { value: 'Heraklion', label: 'Heraklion (Ηράκλειο)' },
  { value: 'Larissa', label: 'Larissa (Λάρισα)' },
  { value: 'Volos', label: 'Volos (Βόλος)' },
  { value: 'Ioannina', label: 'Ioannina (Ιωάννινα)' },
  { value: 'Kavala', label: 'Kavala (Καβάλα)' },
  { value: 'Chania', label: 'Chania (Χανιά)' },
  { value: 'Rhodes', label: 'Rhodes (Ρόδος)' },
  { value: 'Kalamata', label: 'Kalamata (Καλαμάτα)' },
  { value: 'Agrinio', label: 'Agrinio (Αγρίνιο)' },
  { value: 'Katerini', label: 'Katerini (Κατερίνη)' },
  { value: 'Trikala', label: 'Trikala (Τρίκαλα)' },
  { value: 'Serres', label: 'Serres (Σέρρες)' },
  { value: 'Lamia', label: 'Lamia (Λαμία)' },
  { value: 'Alexandroupoli', label: 'Alexandroupoli (Αλεξανδρούπολη)' },
  { value: 'Xanthi', label: 'Xanthi (Ξάνθη)' },
  { value: 'Kozani', label: 'Kozani (Κοζάνη)' },
  { value: 'Drama', label: 'Drama (Δράμα)' },
  { value: 'Veria', label: 'Veria (Βέροια)' },
  { value: 'Karditsa', label: 'Karditsa (Καρδίτσα)' },
  { value: 'Rethymno', label: 'Rethymno (Ρέθυμνο)' },
  { value: 'Chalkida', label: 'Chalkida (Χαλκίδα)' },
  { value: 'Corfu', label: 'Corfu (Κέρκυρα)' },
  { value: 'Sparta', label: 'Sparta (Σπάρτη)' },
  { value: 'Mykonos', label: 'Mykonos (Μύκονος)' },
  { value: 'Santorini', label: 'Santorini (Σαντορίνη)' },
  { value: 'Nafplio', label: 'Nafplio (Ναύπλιο)' },
  { value: 'Zakynthos', label: 'Zakynthos (Ζάκυνθος)' },
]

// Days of week for recurring schedules
export const DAYS_OF_WEEK = [
  { value: 'MO', label: 'Monday', short: 'Mon' },
  { value: 'TU', label: 'Tuesday', short: 'Tue' },
  { value: 'WE', label: 'Wednesday', short: 'Wed' },
  { value: 'TH', label: 'Thursday', short: 'Thu' },
  { value: 'FR', label: 'Friday', short: 'Fri' },
  { value: 'SA', label: 'Saturday', short: 'Sat' },
  { value: 'SU', label: 'Sunday', short: 'Sun' },
]

// Recurrence type constants
export const RECURRENCE_TYPE = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
} as const

export type RecurrenceType = (typeof RECURRENCE_TYPE)[keyof typeof RECURRENCE_TYPE]

// Recurrence frequency options
export const RECURRENCE_OPTIONS = [
  { value: RECURRENCE_TYPE.NONE, label: 'Does not repeat' },
  { value: RECURRENCE_TYPE.DAILY, label: 'Daily' },
  { value: RECURRENCE_TYPE.WEEKLY, label: 'Weekly' },
  { value: RECURRENCE_TYPE.BIWEEKLY, label: 'Every 2 weeks' },
  { value: RECURRENCE_TYPE.MONTHLY, label: 'Monthly' },
]

// Schedule form defaults
export const SCHEDULE_FORM_DEFAULTS = {
  DEFAULT_START_TIME: '09:00',
  EMPTY_TIME: '00:00',
  DEFAULT_DURATION: 60,
  DEFAULT_RECURRENCE_COUNT: 10,
  MIN_RECURRENCE_COUNT: 2,
  MAX_RECURRENCE_COUNT: 52,
  DAYS_IN_WEEK: 7,
} as const

// Day number (0=Sunday) to RRULE day code mapping
export const DAY_NUMBER_TO_RRULE: Record<number, string> = {
  0: 'SU',
  1: 'MO',
  2: 'TU',
  3: 'WE',
  4: 'TH',
  5: 'FR',
  6: 'SA',
}

// Duration options in minutes
export const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 75, label: '1 hour 15 min' },
  { value: 90, label: '1 hour 30 min' },
  { value: 120, label: '2 hours' },
]

// Booking status colors
export const BOOKING_STATUS_COLORS = {
  BOOKED: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/30' },
  WAITLISTED: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/30' },
  CANCELLED: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/30' },
  ATTENDED: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30' },
  NO_SHOW: { bg: 'bg-gray-500/10', text: 'text-gray-600', border: 'border-gray-500/30' },
}

// Class colors for calendar
export const CLASS_COLORS = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#10b981', label: 'Green' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#84cc16', label: 'Lime' },
]
