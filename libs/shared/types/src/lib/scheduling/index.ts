/**
 * Shared scheduling types for both frontend and backend
 * These types represent the contract between API and client
 */

/**
 * Booking status enum values (matching Prisma BookingStatus enum)
 */
export type BookingStatus = 'BOOKED' | 'WAITLISTED' | 'CANCELLED' | 'ATTENDED' | 'NO_SHOW'

/**
 * Base booking type with generic date type
 * Backend uses Date, frontend uses string (after JSON serialization)
 */
export interface BookingBase<TDate = Date | string> {
  id: number
  classScheduleId: number
  participantId: number
  status: BookingStatus
  bookedAt: TDate
  cancelledAt: TDate | null
  attendedAt: TDate | null
  waitlistPosition: number | null
  cancelledByOrganizer: boolean
  cancelReason: string | null
  organizerNotes: string | null
  createdAt: TDate
  participant?: {
    id: number
    appUser: {
      id: number
      authUser: {
        username: string
        firstName: string | null
        lastName: string | null
      }
    }
  }
  classSchedule?: {
    id: number
    startTimeUtc: TDate
    endTimeUtc: TDate
    class: {
      id: number
      title: string
    }
  }
}

/**
 * Booking type for backend (uses Date)
 */
export type BookingDto = BookingBase<Date>

/**
 * Booking type for frontend (uses string after JSON serialization)
 */
export type Booking = BookingBase<string>

/**
 * Booking list response
 */
export interface BookingListResponse<TBooking = Booking> {
  bookings: TBooking[]
  total: number
  booked: number
  waitlisted: number
}

/**
 * My bookings response (for participant view)
 */
export interface MyBookingsResponse<TBooking = Booking> {
  upcoming: TBooking[]
  past: TBooking[]
  cancelled: TBooking[]
}
