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
import { BookingDto, BookingListResponse, MyBookingsResponse } from '@js-monorepo/types/scheduling'

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

// Use shared types from @js-monorepo/types
export type BookingResponseDto = BookingDto
export type BookingListResponseDto = BookingListResponse<BookingDto>
export type MyBookingsResponseDto = MyBookingsResponse<BookingDto>
