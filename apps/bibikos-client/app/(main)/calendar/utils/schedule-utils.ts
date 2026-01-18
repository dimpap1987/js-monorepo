import { addMinutes } from 'date-fns'
import { ScheduleFormData } from '../schemas'

export function buildRecurrenceRule(data: ScheduleFormData): string | null {
  if (data.recurrence === 'none') {
    return null
  }

  const parts: string[] = []

  // Set frequency based on recurrence type
  switch (data.recurrence) {
    case 'daily':
      parts.push('FREQ=DAILY')
      break
    case 'weekly':
      parts.push('FREQ=WEEKLY')
      break
    case 'biweekly':
      parts.push('FREQ=WEEKLY')
      parts.push('INTERVAL=2')
      break
    case 'monthly':
      parts.push('FREQ=MONTHLY')
      break
    default:
      parts.push('FREQ=WEEKLY')
  }

  // Add days of week for weekly/biweekly recurrence
  const hasMultipleDays =
    (data.recurrence === 'weekly' || data.recurrence === 'biweekly') && data.recurrenceDays.length > 0
  if (hasMultipleDays) {
    parts.push(`BYDAY=${data.recurrenceDays.join(',')}`)
  }

  // Calculate total occurrences
  // For weekly with multiple BYDAY values, COUNT = weeks × days per week
  // e.g., 4 weeks of Mon/Tue/Wed = COUNT of 12
  let totalCount = data.recurrenceCount
  if (hasMultipleDays && data.recurrenceDays.length > 1) {
    totalCount = data.recurrenceCount * data.recurrenceDays.length
  }

  parts.push(`COUNT=${totalCount}`)

  return parts.join(';')
}

export function calculateEndTime(date: string, startTime: string, duration: number): Date {
  const startDateTime = new Date(`${date}T${startTime}`)
  return addMinutes(startDateTime, duration)
}
