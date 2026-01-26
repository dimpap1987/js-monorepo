import * as z from 'zod'

// Slug validation: lowercase letters, numbers, and hyphens only
export const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(100)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only (e.g., john-doe)')

// IANA timezone validation (basic pattern)
export const timezoneSchema = z
  .string()
  .max(50)
  .regex(/^[A-Za-z_]+\/[A-Za-z_]+$|^UTC$/, 'Invalid timezone format (e.g., Europe/Athens, UTC)')

// RRULE validation (RFC 5545)
// Examples: "FREQ=WEEKLY;BYDAY=MO,WE,FR", "FREQ=WEEKLY;INTERVAL=2;BYDAY=TU"
export const rruleSchema = z
  .string()
  .max(500)
  .regex(/^FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY)/, 'Invalid RRULE format')
  .optional()
  .nullable()

// =============================================================================
// Organizer Schemas
// =============================================================================
const MIN_ORGANIZER_TAGS = 1
const MAX_ORGANIZER_TAGS = 5

export const CreateOrganizerSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(255),
  bio: z.string().max(5000).optional().nullable(),
  slug: slugSchema.optional(),
  defaultLocationId: z.number().int().positive().optional().nullable(),
  tagIds: z
    .array(z.number().int().positive())
    .min(MIN_ORGANIZER_TAGS, `Please select at least ${MIN_ORGANIZER_TAGS} tag`)
    .max(MAX_ORGANIZER_TAGS, `You can select up to ${MAX_ORGANIZER_TAGS} tags`),
})

export const UpdateOrganizerSchema = CreateOrganizerSchema.partial()

export type CreateOrganizerDto = z.infer<typeof CreateOrganizerSchema>
export type UpdateOrganizerDto = z.infer<typeof UpdateOrganizerSchema>

// =============================================================================
// Location Schemas
// =============================================================================

export const CreateLocationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  countryCode: z
    .string()
    .length(2, 'Country code must be exactly 2 characters')
    .regex(/^[A-Z]{2}$/, 'Country code must be 2 uppercase letters'),
  city: z.string().max(255).optional().nullable(),
  address: z.string().max(1000).optional().nullable(),
  timezone: timezoneSchema,
  isOnline: z.boolean().default(false),
  onlineUrl: z.string().url('Must be a valid URL').max(500).optional().nullable(),
})

export const UpdateLocationSchema = CreateLocationSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type CreateLocationDto = z.infer<typeof CreateLocationSchema>
export type UpdateLocationDto = z.infer<typeof UpdateLocationSchema>

// =============================================================================
// Class Schemas
// =============================================================================

const MIN_CLASS_TAGS = 1
const MAX_CLASS_TAGS = 5

export const CreateClassSchema = z.object({
  locationId: z.number().int().positive('Location ID is required'),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(5000).optional().nullable(),
  capacity: z.number().int().positive('Capacity must be a positive number').optional().nullable(),
  waitlistLimit: z.number().int().min(0, 'Waitlist limit cannot be negative').optional().nullable(),
  isCapacitySoft: z.boolean().default(false),
  isPrivate: z.boolean().default(false),
  tagIds: z
    .array(z.number().int().positive())
    .min(MIN_CLASS_TAGS, `Please select at least ${MIN_CLASS_TAGS} tag`)
    .max(MAX_CLASS_TAGS, `You can select up to ${MAX_CLASS_TAGS} tags`)
    .optional(),
})

export const UpdateClassSchema = CreateClassSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type CreateClassDto = z.infer<typeof CreateClassSchema>
export type UpdateClassDto = z.infer<typeof UpdateClassSchema>

// =============================================================================
// Class Schedule Schemas
// =============================================================================

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

// =============================================================================
// Booking Schemas
// =============================================================================

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

// =============================================================================
// Public Profile Response Schemas
// =============================================================================

export const OrganizerPublicTagSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.string().nullable().optional(),
})

export const OrganizerPublicBadgeSchema = z.object({
  id: z.number(),
  name: z.string(),
})

export const OrganizerPublicClassTypeSchema = z.object({
  id: z.number(),
  title: z.string(),
})

export const OrganizerPublicProfileSchema = z.object({
  displayName: z.string().nullable(),
  bio: z.string().nullable(),
  slug: z.string(),
  profileImage: z.string().nullable(),
  tags: z.array(OrganizerPublicTagSchema),
  badges: z.array(OrganizerPublicBadgeSchema),
  classTypes: z.array(OrganizerPublicClassTypeSchema),
})

export type OrganizerPublicTag = z.infer<typeof OrganizerPublicTagSchema>
export type OrganizerPublicBadge = z.infer<typeof OrganizerPublicBadgeSchema>
export type OrganizerPublicClassType = z.infer<typeof OrganizerPublicClassTypeSchema>
export type OrganizerPublicProfileResponse = z.infer<typeof OrganizerPublicProfileSchema>
