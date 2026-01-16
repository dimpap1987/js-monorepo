import {
  CreateClassScheduleSchema,
  UpdateClassScheduleSchema,
  CancelClassScheduleSchema,
  type CreateClassScheduleDto,
  type UpdateClassScheduleDto,
  type CancelClassScheduleDto,
} from '@js-monorepo/schemas'

// Re-export for backward compatibility
export {
  CreateClassScheduleSchema,
  UpdateClassScheduleSchema,
  CancelClassScheduleSchema,
  type CreateClassScheduleDto,
  type UpdateClassScheduleDto,
  type CancelClassScheduleDto,
}

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
