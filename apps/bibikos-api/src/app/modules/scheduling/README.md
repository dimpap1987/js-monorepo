# Scheduling API Module

## Overview

The scheduling module provides a complete class booking system for individual instructors/coaches. It supports class management, schedule creation (one-time and recurring), participant bookings, private class invitations, and real-time notifications.

---

## Module Structure

```
scheduling/
├── scheduling.module.ts          # Main module aggregator
├── app-users/                    # User profile management
├── onboarding/                   # Onboarding flow
├── organizers/                   # Instructor profiles
├── participants/                 # Participant profiles
├── locations/                    # Physical/online venues
├── classes/                      # Class templates
├── class-schedules/              # Schedule occurrences
├── bookings/                     # Participant registrations
└── invitations/                  # Private class invitations
```

---

## Endpoints Reference

### App Users

| Method | Endpoint                   | Description                             |
| ------ | -------------------------- | --------------------------------------- |
| GET    | `/scheduling/app-users/me` | Get current user's app profile          |
| PATCH  | `/scheduling/app-users/me` | Update profile (locale, timezone, etc.) |

### Onboarding

| Method | Endpoint                          | Description                                              |
| ------ | --------------------------------- | -------------------------------------------------------- |
| POST   | `/scheduling/onboarding/complete` | Complete onboarding (creates organizer, location, class) |

### Organizers

| Method | Endpoint                                     | Description                   |
| ------ | -------------------------------------------- | ----------------------------- |
| GET    | `/scheduling/organizers/me`                  | Get current organizer profile |
| POST   | `/scheduling/organizers`                     | Create organizer profile      |
| PATCH  | `/scheduling/organizers/me`                  | Update organizer profile      |
| GET    | `/scheduling/organizers/public/:slug`        | Get public organizer profile  |
| GET    | `/scheduling/organizers/slug-check?slug=xxx` | Check slug availability       |

### Locations

| Method | Endpoint                    | Description                |
| ------ | --------------------------- | -------------------------- |
| GET    | `/scheduling/locations`     | List organizer's locations |
| GET    | `/scheduling/locations/:id` | Get single location        |
| POST   | `/scheduling/locations`     | Create location            |
| PATCH  | `/scheduling/locations/:id` | Update location            |
| DELETE | `/scheduling/locations/:id` | Delete location            |

### Classes

| Method | Endpoint                         | Description                                                      |
| ------ | -------------------------------- | ---------------------------------------------------------------- |
| GET    | `/scheduling/classes`            | List organizer's classes                                         |
| GET    | `/scheduling/classes/:id`        | Get single class (organizer view)                                |
| GET    | `/scheduling/classes/:id/public` | Get class for public view                                        |
| GET    | `/scheduling/classes/:id/view`   | Get class with schedules for booking (checks access for private) |
| POST   | `/scheduling/classes`            | Create class                                                     |
| PATCH  | `/scheduling/classes/:id`        | Update class                                                     |
| DELETE | `/scheduling/classes/:id`        | Deactivate class (soft delete)                                   |

### Class Schedules

| Method | Endpoint                                               | Description                                 |
| ------ | ------------------------------------------------------ | ------------------------------------------- |
| GET    | `/scheduling/schedules/discover`                       | Discover public + private (invited) classes |
| GET    | `/scheduling/schedules/calendar?startDate=X&endDate=Y` | Get schedules for date range (organizer)    |
| GET    | `/scheduling/schedules/public/:slug`                   | Get public schedules by organizer slug      |
| GET    | `/scheduling/schedules/:id`                            | Get single schedule (organizer view)        |
| GET    | `/scheduling/schedules/:id/public`                     | Get schedule for public view                |
| GET    | `/scheduling/schedules/class/:classId/upcoming`        | Get upcoming schedules for class            |
| POST   | `/scheduling/schedules`                                | Create schedule (one-time or recurring)     |
| PATCH  | `/scheduling/schedules/:id`                            | Update schedule                             |
| POST   | `/scheduling/schedules/:id/cancel`                     | Cancel single schedule                      |
| POST   | `/scheduling/schedules/:id/cancel-series`              | Cancel entire recurring series              |
| DELETE | `/scheduling/schedules/:id/future`                     | Delete future occurrences                   |

### Bookings

| Method | Endpoint                                       | Description                     |
| ------ | ---------------------------------------------- | ------------------------------- |
| GET    | `/scheduling/bookings/schedule/:scheduleId`    | Get bookings for schedule       |
| GET    | `/scheduling/bookings/my`                      | Get current user's bookings     |
| POST   | `/scheduling/bookings`                         | Create booking                  |
| POST   | `/scheduling/bookings/:id/cancel`              | Cancel booking (by participant) |
| POST   | `/scheduling/bookings/:id/cancel-by-organizer` | Cancel booking (by organizer)   |
| POST   | `/scheduling/bookings/attendance`              | Mark attendance (batch)         |
| PATCH  | `/scheduling/bookings/:id/notes`               | Update organizer notes          |

### Invitations (Private Classes)

| Method | Endpoint                                 | Description                        |
| ------ | ---------------------------------------- | ---------------------------------- |
| POST   | `/scheduling/invitations`                | Send invitation to private class   |
| GET    | `/scheduling/invitations/pending`        | Get pending invitations for user   |
| GET    | `/scheduling/invitations/sent`           | Get invitations sent by organizer  |
| GET    | `/scheduling/invitations/class/:classId` | Get invitations for specific class |
| PATCH  | `/scheduling/invitations/:id/respond`    | Accept or decline invitation       |
| DELETE | `/scheduling/invitations/:id`            | Cancel/revoke invitation           |

---

## Data Models

### Core Entities

```
AppUser (1) ─────────┬──────────── OrganizerProfile (0..1)
                     └──────────── ParticipantProfile (0..1)

OrganizerProfile (1) ────────────── Location (*)
                     └──────────── Class (*)
                     └──────────── ClassInvitation (*)

Class (1) ───────────────────────── ClassSchedule (*)
          └──────────────────────── ClassInvitation (*)

ClassSchedule (1) ───────────────── Booking (*)
ParticipantProfile (1) ──────────── Booking (*)
AppUser (1) ─────────────────────── ClassInvitation (*) [as invitee]
```

### Class Model

```typescript
interface Class {
  id: number
  organizerId: number
  locationId: number
  title: string
  description: string | null
  capacity: number | null // Max participants (null = unlimited)
  waitlistLimit: number | null // Max waitlist size
  isCapacitySoft: boolean // Soft = recommendation only
  isPrivate: boolean // Requires invitation to book
  isActive: boolean // Soft delete flag
}
```

### Invitation Model

```typescript
interface ClassInvitation {
  id: number
  classId: number
  organizerId: number
  invitedUserId: number | null // Resolved AppUser ID
  invitedUsername: string | null // Original target
  invitedEmail: string | null // Email target
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
  message: string | null // Personal message
  expiresAt: Date | null // Optional expiration
}
```

### Recurrence Model

```
ClassSchedule (parent, recurrenceRule set)
    │
    ├── ClassSchedule (child, parentScheduleId points to parent)
    ├── ClassSchedule (child)
    └── ClassSchedule (child)
```

---

## Recurrence Rule Format (RFC 5545)

### Supported Components

- `FREQ`: DAILY, WEEKLY, MONTHLY, YEARLY
- `INTERVAL`: Number (default: 1)
- `BYDAY`: MO,TU,WE,TH,FR,SA,SU
- `COUNT`: Number of occurrences
- `UNTIL`: End date (ISO format)

### Examples

```
# Every day for 7 days
FREQ=DAILY;COUNT=7

# Every Monday, Wednesday, Friday for 10 weeks
FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=10

# Every other Tuesday for 5 occurrences
FREQ=WEEKLY;INTERVAL=2;BYDAY=TU;COUNT=5

# Monthly on the same day, until a specific date
FREQ=MONTHLY;UNTIL=2026-06-01
```

---

## Implementation Status

### Completed ✅

**User & Profile Management**

- [x] App user profile management (locale, timezone)
- [x] Organizer profile CRUD with public slug
- [x] Participant profile management
- [x] Streamlined onboarding flow

**Class Management**

- [x] Class CRUD operations
- [x] Capacity management (hard/soft limits)
- [x] Waitlist support with configurable limits
- [x] Private class flag
- [x] Soft deletion (deactivation)

**Scheduling**

- [x] One-time schedule creation
- [x] Recurring schedule creation (RFC 5545 RRULE)
- [x] Calendar view endpoint (date range query)
- [x] Single schedule cancellation
- [x] Series cancellation (cancel all future)
- [x] Delete future occurrences
- [x] Public discovery endpoint with filters

**Bookings**

- [x] Booking creation with capacity checking
- [x] Waitlist with position tracking
- [x] Waitlist auto-promotion on cancellation
- [x] Attendance marking (ATTENDED/NO_SHOW)
- [x] Participant and organizer cancellations
- [x] Organizer notes on bookings
- [x] Rebooking support

**Invitations (Private Classes)**

- [x] Send invitations by username or email
- [x] Accept/decline invitations
- [x] Access control for private class booking
- [x] Private classes in discover (for invited users)
- [x] Redirect to class page after accepting

**Real-time Features**

- [x] WebSocket notifications for bookings
- [x] WebSocket notifications for invitations
- [x] Schedule cancellation notifications
- [x] Push notifications for invitations

**Location Management**

- [x] Location CRUD
- [x] Online vs physical venues
- [x] Timezone support (IANA format)
- [x] Default location per organizer

### Pending ❌

- [ ] Schedule conflict detection
- [ ] Bulk schedule operations
- [ ] Email notifications (reminders, confirmations)
- [ ] Schedule templates
- [ ] Recurring schedule editing (edit all vs single)

---

## Key Implementation Details

### Timezone Handling

- All times stored in UTC (`startTimeUtc`, `endTimeUtc`)
- `localTimezone` copied from location at schedule creation
- Frontend responsible for display conversion

### Capacity & Waitlist

```typescript
// Booking flow
1. Check if spots available (booked < capacity)
2. If available → status = BOOKED
3. If full and waitlist enabled → status = WAITLISTED, assign position
4. If full and no waitlist → reject booking

// On cancellation
1. Mark booking as CANCELLED
2. Find first WAITLISTED booking for same schedule
3. Promote to BOOKED, clear waitlistPosition
4. Decrement positions for remaining waitlisted
5. Notify promoted participant via WebSocket
```

### Private Class Access

```typescript
// Creating private class
1. Create class with isPrivate = true
2. Send invitations to specific users

// Invitation flow
1. Organizer sends invitation (by username or email)
2. System resolves to AppUser if exists
3. User receives notification (WebSocket + push)
4. User accepts/declines at /my-invitations
5. On accept → redirect to /class/:id

// Booking private class
1. User tries to view/book private class
2. System checks if user has ACCEPTED invitation
3. If yes → allow booking
4. If no → return 403 CLASS_ACCESS_DENIED
```

### Discovery Filters

```typescript
// GET /scheduling/schedules/discover
{
  startDate: string,           // Required: ISO date
  endDate: string,             // Required: ISO date (max 92 days range)
  activity?: string,           // Filter by organizer's activity label
  timeOfDay?: 'morning' | 'afternoon' | 'evening',
  search?: string              // Search class title or organizer name
}

// Returns: public classes + private classes with accepted invitation
// Includes user's booking status if logged in
```

### Recurring Schedule Generation

```typescript
// When creating a recurring schedule:
1. Parse RRULE
2. Create parent schedule with recurrenceRule
3. Generate child occurrences (up to COUNT or 12 weeks ahead)
4. Each child has parentScheduleId pointing to parent
```

---

## Testing

### Unit Tests

```bash
npx nx test bibikos-api --testFile=class-schedule.service.spec.ts
```

### Manual Testing

```bash
# Create organizer (requires authenticated session)
curl -X POST http://localhost:3000/scheduling/organizers \
  -H "Content-Type: application/json" \
  -d '{"displayName": "John Coach", "slug": "john-coach"}'

# Create location
curl -X POST http://localhost:3000/scheduling/locations \
  -H "Content-Type: application/json" \
  -d '{"name": "Downtown Studio", "countryCode": "GR", "timezone": "Europe/Athens"}'

# Create class
curl -X POST http://localhost:3000/scheduling/classes \
  -H "Content-Type: application/json" \
  -d '{"locationId": 1, "title": "Morning Yoga", "capacity": 10}'

# Create one-time schedule
curl -X POST http://localhost:3000/scheduling/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "classId": 1,
    "startTimeUtc": "2026-01-20T08:00:00Z",
    "endTimeUtc": "2026-01-20T09:00:00Z"
  }'

# Create recurring schedule
curl -X POST http://localhost:3000/scheduling/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "classId": 1,
    "startTimeUtc": "2026-01-20T08:00:00Z",
    "endTimeUtc": "2026-01-20T09:00:00Z",
    "recurrenceRule": "FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=12"
  }'

# Get calendar schedules
curl "http://localhost:3000/scheduling/schedules/calendar?startDate=2026-01-01&endDate=2026-02-01"
```

---

## Error Codes

| Code                           | Description                              |
| ------------------------------ | ---------------------------------------- |
| `NOT_AN_ORGANIZER`             | User doesn't have organizer profile      |
| `CLASS_NOT_FOUND`              | Class doesn't exist                      |
| `CLASS_ACCESS_DENIED`          | Class belongs to different organizer     |
| `SCHEDULE_NOT_FOUND`           | Schedule doesn't exist                   |
| `SCHEDULE_ACCESS_DENIED`       | Schedule belongs to different organizer  |
| `SCHEDULE_ALREADY_CANCELLED`   | Cannot cancel already cancelled schedule |
| `END_TIME_MUST_BE_AFTER_START` | Invalid time range                       |
| `DATE_RANGE_TOO_LARGE`         | Calendar query exceeds 92 days           |
| `CLASS_FULL`                   | No spots available and no waitlist       |
| `ALREADY_BOOKED`               | Participant already has booking          |

---

## Future Enhancements

### Phase 2 - Payments & Credits

| Feature            | Priority | Description                       |
| ------------------ | -------- | --------------------------------- |
| Session Pricing    | High     | Set price per class/schedule      |
| Payment Processing | High     | Stripe integration for bookings   |
| Credit Packages    | High     | Buy X sessions, use over time     |
| Refund Handling    | Medium   | Automatic refunds on cancellation |
| Revenue Reports    | Medium   | Organizer earnings dashboard      |

### Phase 3 - Communication

| Feature               | Priority | Description                                  |
| --------------------- | -------- | -------------------------------------------- |
| Email Reminders       | High     | Automated booking reminders (24h, 1h before) |
| Booking Confirmations | High     | Email on successful booking                  |
| SMS Notifications     | Medium   | Text message reminders                       |
| Class Announcements   | Medium   | Broadcast to all participants                |

### Phase 4 - Advanced Scheduling

| Feature               | Priority | Description                      |
| --------------------- | -------- | -------------------------------- |
| Schedule Conflicts    | High     | Detect overlapping schedules     |
| Bulk Operations       | Medium   | Update/cancel multiple schedules |
| Schedule Templates    | Medium   | Save and reuse configurations    |
| Edit Recurring Series | Medium   | Edit all vs single occurrence    |
| Substitution System   | Low      | Replace instructor for a session |

### Phase 5 - Analytics & Reporting

| Feature             | Priority | Description                     |
| ------------------- | -------- | ------------------------------- |
| Attendance Reports  | High     | Track attendance rates by class |
| Booking Analytics   | High     | Popular times, fill rates       |
| No-show Tracking    | Medium   | Identify frequent no-shows      |
| Revenue Analytics   | Medium   | Earnings over time              |
| Export Capabilities | Low      | CSV/PDF report exports          |

### Phase 6 - Enhanced Discovery

| Feature               | Priority | Description                        |
| --------------------- | -------- | ---------------------------------- |
| Location-based Search | Medium   | Find classes near user             |
| Recommendations       | Low      | Suggested classes based on history |
| Reviews/Ratings       | Low      | Participant feedback system        |
| Favorites             | Low      | Save favorite classes/organizers   |

### Phase 7 - Organization Support

| Feature               | Priority | Description                           |
| --------------------- | -------- | ------------------------------------- |
| Multi-instructor      | Medium   | Multiple organizers per class         |
| Staff Management      | Medium   | Instructors separate from owners      |
| Organization Accounts | Low      | Gyms/studios with multiple organizers |
| Resource Booking      | Low      | Equipment reservation with bookings   |

### Technical Improvements

| Feature        | Priority | Description                      |
| -------------- | -------- | -------------------------------- |
| Caching Layer  | Medium   | Redis caching for discovery      |
| Rate Limiting  | Medium   | Protect against abuse            |
| Audit Logging  | Low      | Track all changes for compliance |
| API Versioning | Low      | Version API for backwards compat |
