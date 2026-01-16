import * as z from 'zod'

export const CreateBookingSchema = z.object({
  classScheduleId: z.number().int().positive('Schedule ID is required'),
})

export const CancelBookingSchema = z.object({
  cancelReason: z.string().max(500).optional(),
})

export const MarkAttendanceSchema = z.object({
  bookingIds: z.array(z.number().int().positive()).min(1, 'At least one booking ID required'),
  status: z.enum(['ATTENDED', 'NO_SHOW']),
})

export const UpdateBookingNotesSchema = z.object({
  organizerNotes: z.string().max(2000).optional().nullable(),
})

export type CreateBookingDto = z.infer<typeof CreateBookingSchema>
export type CancelBookingDto = z.infer<typeof CancelBookingSchema>
export type MarkAttendanceDto = z.infer<typeof MarkAttendanceSchema>
export type UpdateBookingNotesDto = z.infer<typeof UpdateBookingNotesSchema>

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
