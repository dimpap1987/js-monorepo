import {
  CreateBookingSchema,
  CancelBookingSchema,
  MarkAttendanceSchema,
  UpdateBookingNotesSchema,
  type CreateBookingDto,
  type CancelBookingDto,
  type MarkAttendanceDto,
  type UpdateBookingNotesDto,
} from '@js-monorepo/schemas'

// Re-export for backward compatibility
export {
  CreateBookingSchema,
  CancelBookingSchema,
  MarkAttendanceSchema,
  UpdateBookingNotesSchema,
  type CreateBookingDto,
  type CancelBookingDto,
  type MarkAttendanceDto,
  type UpdateBookingNotesDto,
}

export interface BookingResponseDto {
  id: number
  classScheduleId: number
  participantId: number
  status: 'BOOKED' | 'WAITLISTED' | 'CANCELLED' | 'ATTENDED' | 'NO_SHOW'
  bookedAt: Date
  cancelledAt: Date | null
  attendedAt: Date | null
  waitlistPosition: number | null
  cancelledByOrganizer: boolean
  cancelReason: string | null
  organizerNotes: string | null
  createdAt: Date
  participant?: {
    id: number
    appUser: {
      id: number
      fullName: string | null
      authUser: {
        email: string
        username: string
      }
    }
  }
  classSchedule?: {
    id: number
    startTimeUtc: Date
    endTimeUtc: Date
    class: {
      id: number
      title: string
    }
  }
}

export interface BookingListResponseDto {
  bookings: BookingResponseDto[]
  total: number
  booked: number
  waitlisted: number
}

// For participant's "my bookings" view
export interface MyBookingsResponseDto {
  upcoming: BookingResponseDto[]
  past: BookingResponseDto[]
}
