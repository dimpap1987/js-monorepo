import * as z from 'zod'

// RRULE validation (RFC 5545)
// Examples: "FREQ=WEEKLY;BYDAY=MO,WE,FR", "FREQ=WEEKLY;INTERVAL=2;BYDAY=TU"
const rruleSchema = z
  .string()
  .max(500)
  .regex(/^FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY)/, 'Invalid RRULE format')
  .optional()
  .nullable()

export const CreateClassScheduleSchema = z.object({
  classId: z.number().int().positive('Class ID is required'),
  startTimeUtc: z.string().datetime('Start time must be a valid ISO 8601 datetime'),
  endTimeUtc: z.string().datetime('End time must be a valid ISO 8601 datetime'),
  recurrenceRule: rruleSchema,
})

export const UpdateClassScheduleSchema = z.object({
  startTimeUtc: z.string().datetime('Start time must be a valid ISO 8601 datetime').optional(),
  endTimeUtc: z.string().datetime('End time must be a valid ISO 8601 datetime').optional(),
  recurrenceRule: rruleSchema,
})

export const CancelClassScheduleSchema = z.object({
  cancelReason: z.string().max(500).optional(),
})

export type CreateClassScheduleDto = z.infer<typeof CreateClassScheduleSchema>
export type UpdateClassScheduleDto = z.infer<typeof UpdateClassScheduleSchema>
export type CancelClassScheduleDto = z.infer<typeof CancelClassScheduleSchema>

export interface ClassScheduleResponseDto {
  id: number
  classId: number
  startTimeUtc: Date
  endTimeUtc: Date
  localTimezone: string
  recurrenceRule: string | null
  occurrenceDate: string | null
  parentScheduleId: number | null
  isCancelled: boolean
  cancelledAt: Date | null
  cancelReason: string | null
  createdAt: Date
  class?: {
    id: number
    title: string
    capacity: number | null
    waitlistLimit: number | null
    isCapacitySoft: boolean
  }
  bookingCounts?: {
    booked: number
    waitlisted: number
  }
}

// For calendar view
export interface ScheduleCalendarQueryDto {
  startDate: string // ISO date YYYY-MM-DD
  endDate: string // ISO date YYYY-MM-DD
  classId?: number
}
