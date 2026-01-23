// =============================================================================
// Scheduling Types for Frontend
// =============================================================================

import { BookingStatus } from '@js-monorepo/types/scheduling'

// App User
export interface AppUser {
  id: number
  fullName: string | null
  locale: string
  timezone: string
  countryCode: string | null
  createdAt: string
  hasOrganizerProfile: boolean
  hasParticipantProfile: boolean
}

export interface UpdateAppUserPayload {
  fullName?: string | null
  locale?: string
  timezone?: string
  countryCode?: string | null
}

// Organizer
export interface OrganizerProfile {
  id: number
  displayName: string | null
  bio: string | null
  slug: string | null
  activityLabel: string | null
  cancellationPolicy: string | null
  defaultLocationId: number | null
  createdAt: string
}

export interface CreateOrganizerPayload {
  displayName?: string
  bio?: string | null
  slug?: string
  activityLabel?: string | null
  cancellationPolicy?: string | null
  defaultLocationId?: number | null
}

export interface UpdateOrganizerPayload extends Partial<CreateOrganizerPayload> {}

export interface OrganizerPublicProfile {
  displayName: string | null
  bio: string | null
  slug: string
  activityLabel: string | null
}

// Participant
export interface ParticipantProfile {
  id: number
  appUserId: number
  createdAt: string
}

// Location
export interface Location {
  id: number
  name: string
  countryCode: string
  city: string | null
  address: string | null
  timezone: string
  isOnline: boolean
  onlineUrl: string | null
  isActive: boolean
  createdAt: string
}

export interface CreateLocationPayload {
  name: string
  countryCode: string
  city?: string | null
  address?: string | null
  timezone: string
  isOnline?: boolean
  onlineUrl?: string | null
}

export interface UpdateLocationPayload extends Partial<CreateLocationPayload> {
  isActive?: boolean
}

// Class
export interface Class {
  id: number
  organizerId: number
  locationId: number
  title: string
  description: string | null
  capacity: number | null
  waitlistLimit: number | null
  isCapacitySoft: boolean
  isActive: boolean
  isPrivate: boolean
  createdAt: string
  location?: {
    id: number
    name: string
    timezone: string
    isOnline: boolean
  }
}

export interface CreateClassPayload {
  locationId: number
  title: string
  description?: string | null
  capacity?: number | null
  waitlistLimit?: number | null
  isCapacitySoft?: boolean
  isPrivate?: boolean
}

export interface UpdateClassPayload extends Partial<CreateClassPayload> {
  isActive?: boolean
}

// Class Schedule
export interface ClassSchedule {
  id: number
  classId: number
  startTimeUtc: string
  endTimeUtc: string
  localTimezone: string
  recurrenceRule: string | null
  occurrenceDate: string | null
  parentScheduleId: number | null
  isCancelled: boolean
  cancelledAt: string | null
  cancelReason: string | null
  createdAt: string
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

export interface CreateSchedulePayload {
  classId: number
  startTimeUtc: string
  endTimeUtc: string
  recurrenceRule?: string | null
}

export interface UpdateSchedulePayload {
  startTimeUtc?: string
  endTimeUtc?: string
}

export interface CancelSchedulePayload {
  cancelReason?: string
}

// Discover Schedule (includes organizer info for public discovery)
export interface DiscoverSchedule extends ClassSchedule {
  organizer: {
    id: number
    displayName: string | null
    slug: string | null
    activityLabel: string | null
  }
  // User's booking for this schedule (if logged in)
  myBooking: {
    id: number
    status: BookingStatus
    waitlistPosition: number | null
  } | null
}

export interface DiscoverFilters {
  activity?: string
  timeOfDay?: 'morning' | 'afternoon' | 'evening'
  search?: string
}

export interface DiscoverSchedulesResponse {
  content: DiscoverSchedule[]
  nextCursor: number | null
  hasMore: boolean
  limit: number
}

// Re-export shared booking types from @js-monorepo/types
export type { BookingStatus, Booking, BookingListResponse, MyBookingsResponse } from '@js-monorepo/types/scheduling'

export interface CreateBookingPayload {
  classScheduleId: number
}

export interface CancelBookingPayload {
  cancelReason?: string
}

export interface MarkAttendancePayload {
  bookingIds: number[]
  status: 'ATTENDED' | 'NO_SHOW'
}

export interface UpdateBookingNotesPayload {
  organizerNotes?: string | null
}

// Calendar Event (for FullCalendar)
export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  extendedProps: {
    schedule: ClassSchedule
    class: Class
    bookingCounts: {
      booked: number
      waitlisted: number
    }
  }
  backgroundColor?: string
  borderColor?: string
  textColor?: string
}

// Class Invitations
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'

export interface ClassInvitation {
  id: number
  classId: number
  className: string
  organizerId: number
  organizerName: string | null
  invitedUserId: number | null
  invitedUsername: string | null
  invitedEmail: string | null
  status: InvitationStatus
  message: string | null
  createdAt: string
  respondedAt: string | null
  expiresAt: string | null
}

export interface PendingInvitation {
  id: number
  classId: number
  className: string
  classDescription: string | null
  organizerName: string | null
  organizerSlug: string | null
  message: string | null
  createdAt: string
  expiresAt: string | null
}

export interface SendInvitationPayload {
  classId: number
  username?: string
  email?: string
  message?: string
}

export interface RespondToInvitationPayload {
  status: 'ACCEPTED' | 'DECLINED'
}

// Class View Response (for class detail page)
export interface ClassViewSchedule {
  id: number
  startTimeUtc: string
  endTimeUtc: string
  localTimezone: string
  bookingCounts: {
    booked: number
    waitlisted: number
  }
}

export interface ClassViewResponse {
  id: number
  title: string
  description: string | null
  capacity: number | null
  isPrivate: boolean
  location: {
    id: number
    name: string
    timezone: string
    isOnline: boolean
  }
  organizer: {
    id: number
    displayName: string | null
    slug: string | null
    activityLabel: string | null
  }
  schedules: ClassViewSchedule[]
}
