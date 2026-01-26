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
  defaultLocationId: number | null
  createdAt: string
}
export interface OrganizerPublicTag {
  id: number
  name: string
  category?: string | null
}

export interface OrganizerPublicBadge {
  id: number
  name: string
}

export interface OrganizerPublicClassType {
  id: number
  title: string
}

export interface OrganizerPublicProfile {
  displayName: string | null
  bio: string | null
  slug: string
  profileImage: string | null
  tags: OrganizerPublicTag[]
  badges: OrganizerPublicBadge[]
  classTypes: OrganizerPublicClassType[]
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

// User's booking info (shared across multiple schedule types)
export interface MyBookingInfo {
  id: number
  status: BookingStatus
  waitlistPosition: number | null
}

// Organizer Public Schedule (for /coach/:slug page)
export interface OrganizerPublicSchedule extends ClassSchedule {
  myBooking: MyBookingInfo | null
}

// Discover Schedule (includes organizer info for public discovery)
export interface DiscoverSchedule extends ClassSchedule {
  organizer: {
    id: number
    displayName: string | null
    slug: string | null
  }
  tags: Array<{
    id: number
    name: string
  }>
  // User's booking for this schedule (if logged in)
  myBooking: MyBookingInfo | null
}

export interface DiscoverFilters {
  timeOfDay?: 'morning' | 'afternoon' | 'evening'
  search?: string
  tagIds?: number[]
}

export interface DiscoverSchedulesResponse {
  content: DiscoverSchedule[]
  nextCursor: number | null
  hasMore: boolean
  limit: number
}

// Re-export shared booking types from @js-monorepo/types
export type { BookingStatus, Booking, BookingListResponse, MyBookingsResponse } from '@js-monorepo/types/scheduling'

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
  // User's booking for this schedule (if logged in)
  myBooking: {
    id: number
    status: BookingStatus
    waitlistPosition: number | null
  } | null
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
  }
  schedules: ClassViewSchedule[]
}
