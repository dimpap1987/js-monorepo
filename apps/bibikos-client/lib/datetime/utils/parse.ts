import { parseISO, isValid } from 'date-fns'

/**
 * Safely parse an ISO date string
 * Returns null if the string is invalid
 */
export function safeParseISO(dateString: string | null | undefined): Date | null {
  if (!dateString) return null

  try {
    const date = parseISO(dateString)
    return isValid(date) ? date : null
  } catch {
    return null
  }
}

/**
 * Parse an ISO date string, throwing if invalid
 */
export function parseISOStrict(dateString: string): Date {
  const date = parseISO(dateString)
  if (!isValid(date)) {
    throw new Error(`Invalid date string: ${dateString}`)
  }
  return date
}
