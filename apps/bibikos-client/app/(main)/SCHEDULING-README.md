# Bibikos Scheduling System

## Overview

A complete scheduling system for fitness/wellness organizers (coaches, instructors) to manage classes and bookings. Participants can discover, book, and manage their class reservations.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                 │
│  (bibikos-client - Next.js 14 App Router)                       │
├─────────────────────────────────────────────────────────────────┤
│  /calendar      → Calendar view, create/manage schedules        │
│  /classes       → Manage class types                            │
│  /locations     → Manage locations (online/in-person)           │
│  /bookings      → Participant booking management                │
│  /dashboard     → Organizer dashboard overview                  │
│  /onboarding    → New organizer setup flow                      │
│  /coach/[slug]  → Public organizer profile page                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Backend                                 │
│  (bibikos-api - NestJS)                                         │
├─────────────────────────────────────────────────────────────────┤
│  /scheduling/app-users     → App user profile management        │
│  /scheduling/organizers    → Organizer CRUD                     │
│  /scheduling/participants  → Participant management             │
│  /scheduling/locations     → Location CRUD                      │
│  /scheduling/classes       → Class type CRUD                    │
│  /scheduling/schedules     → Schedule management & calendar     │
│  /scheduling/bookings      → Booking & attendance               │
│  /scheduling/onboarding    → Onboarding status & flow           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Database                                 │
│  (PostgreSQL via Prisma)                                        │
├─────────────────────────────────────────────────────────────────┤
│  AppUser, Organizer, Participant, Location, Class,              │
│  ClassSchedule, Booking                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### App Users (`/scheduling/app-users`)

| Method | Endpoint | Description                             | Auth |
| ------ | -------- | --------------------------------------- | ---- |
| GET    | `/me`    | Get current user's app profile          | ✅   |
| PATCH  | `/me`    | Update profile (name, locale, timezone) | ✅   |

### Organizers (`/scheduling/organizers`)

| Method | Endpoint        | Description                          | Auth |
| ------ | --------------- | ------------------------------------ | ---- |
| GET    | `/me`           | Get current user's organizer profile | ✅   |
| POST   | `/`             | Create organizer profile             | ✅   |
| PATCH  | `/me`           | Update organizer profile             | ✅   |
| GET    | `/public/:slug` | Get public organizer profile         | ❌   |

### Locations (`/scheduling/locations`)

| Method | Endpoint | Description                | Auth |
| ------ | -------- | -------------------------- | ---- |
| GET    | `/`      | List organizer's locations | ✅   |
| GET    | `/:id`   | Get single location        | ✅   |
| POST   | `/`      | Create location            | ✅   |
| PATCH  | `/:id`   | Update location            | ✅   |
| DELETE | `/:id`   | Soft delete location       | ✅   |

### Classes (`/scheduling/classes`)

| Method | Endpoint      | Description                    | Auth |
| ------ | ------------- | ------------------------------ | ---- |
| GET    | `/`           | List organizer's classes       | ✅   |
| GET    | `/:id`        | Get single class with location | ✅   |
| GET    | `/:id/public` | Get class for public view      | ❌   |
| POST   | `/`           | Create class                   | ✅   |
| PATCH  | `/:id`        | Update class                   | ✅   |
| DELETE | `/:id`        | Soft delete class              | ✅   |

### Schedules (`/scheduling/schedules`)

| Method | Endpoint                   | Description                                        | Auth |
| ------ | -------------------------- | -------------------------------------------------- | ---- |
| GET    | `/calendar`                | Get schedules for date range (with booking counts) | ✅   |
| GET    | `/:id`                     | Get single schedule                                | ✅   |
| GET    | `/:id/public`              | Get schedule for public booking page               | ❌   |
| GET    | `/class/:classId/upcoming` | Get upcoming schedules for a class                 | ✅   |
| POST   | `/`                        | Create schedule (one-time or recurring)            | ✅   |
| PATCH  | `/:id`                     | Update schedule                                    | ✅   |
| POST   | `/:id/cancel`              | Cancel schedule                                    | ✅   |
| DELETE | `/:id/future`              | Delete future occurrences                          | ✅   |

### Bookings (`/scheduling/bookings`)

| Method | Endpoint                   | Description                           | Auth |
| ------ | -------------------------- | ------------------------------------- | ---- |
| POST   | `/`                        | Book a class (participant)            | ✅   |
| GET    | `/my`                      | Get user's bookings (upcoming/past)   | ✅   |
| POST   | `/:id/cancel`              | Cancel booking (participant)          | ✅   |
| GET    | `/schedule/:scheduleId`    | Get bookings for schedule (organizer) | ✅   |
| POST   | `/:id/cancel-by-organizer` | Cancel booking (organizer)            | ✅   |
| POST   | `/attendance`              | Mark attendance (batch)               | ✅   |
| PATCH  | `/:id/notes`               | Update organizer notes                | ✅   |

### Onboarding (`/scheduling/onboarding`)

| Method | Endpoint  | Description                      | Auth |
| ------ | --------- | -------------------------------- | ---- |
| GET    | `/status` | Get onboarding completion status | ✅   |

---

## Frontend Pages

### `/calendar` - Schedule Management

**Purpose**: Visual calendar for organizers to create and manage class schedules.

**Features**:

- Monthly, weekly, list views (responsive)
- Click date to create single schedule
- Drag to select date range for recurring schedules
- Click event to view details & participants
- Class color-coding with legend/filter
- Capacity indicators (normal → yellow → red)

**Components**:

- `CalendarView` - FullCalendar wrapper
- `ScheduleForm` - Create schedule dialog
- `ScheduleDetailSheet` - View schedule & participants
- `ClassLegend` - Filter by class

### `/classes` - Class Type Management

**Purpose**: Create and manage class types (e.g., "Yoga Basics", "HIIT Training").

**Features**:

- List all classes with status
- Create/edit class with capacity settings
- Link to location
- Soft capacity option (allow overbooking)
- Waitlist limit configuration

### `/locations` - Location Management

**Purpose**: Manage where classes take place.

**Features**:

- In-person locations (address, city, timezone)
- Online locations (with meeting URL)
- Timezone support for scheduling

### `/bookings` - Participant Bookings

**Purpose**: View and manage personal bookings (participant view).

**Features**:

- Upcoming vs past bookings
- Cancel booking with optional reason
- View class details

### `/dashboard` - Organizer Dashboard

**Purpose**: Overview of organizer's scheduling activity.

**Features**:

- Today's schedule summary
- Upcoming classes
- Quick actions

### `/onboarding` - Setup Wizard

**Purpose**: Guide new organizers through initial setup.

**Steps**:

1. Profile setup (display name, bio, slug)
2. Create first location
3. Create first class

---

## Data Models

### ClassSchedule

```prisma
model ClassSchedule {
  id               Int       @id @default(autoincrement())
  classId          Int
  startTimeUtc     DateTime  @db.Timestamptz()
  endTimeUtc       DateTime  @db.Timestamptz()
  localTimezone    String    // Copied from location at creation
  recurrenceRule   String?   // RFC 5545 RRULE format
  occurrenceDate   String?   // YYYY-MM-DD for recurring instances
  parentScheduleId Int?      // Links child occurrences to parent
  isCancelled      Boolean   @default(false)
  cancelledAt      DateTime?
  cancelReason     String?

  class            Class     @relation(...)
  parentSchedule   ClassSchedule? @relation(...)
  bookings         Booking[]
}
```

### Booking

```prisma
model Booking {
  id                  Int           @id @default(autoincrement())
  classScheduleId     Int
  participantId       Int
  status              BookingStatus // BOOKED, WAITLISTED, CANCELLED, ATTENDED, NO_SHOW
  bookedAt            DateTime      @default(now())
  cancelledAt         DateTime?
  cancelReason        String?
  cancelledByOrganizer Boolean      @default(false)
  attendedAt          DateTime?
  waitlistPosition    Int?
  organizerNotes      String?
}
```

---

## Recurrence System

### RRULE Format (RFC 5545)

Schedules support recurring patterns using standard RRULE syntax:

| Pattern               | RRULE                                     | Description                          |
| --------------------- | ----------------------------------------- | ------------------------------------ |
| Daily for 5 days      | `FREQ=DAILY;COUNT=5`                      | Creates 5 consecutive daily sessions |
| Weekly on Mon/Wed/Fri | `FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=10`     | 10 sessions on specified days        |
| Bi-weekly on Tuesday  | `FREQ=WEEKLY;INTERVAL=2;BYDAY=TU;COUNT=6` | Every other Tuesday, 6 times         |
| Monthly               | `FREQ=MONTHLY;COUNT=3`                    | Same day each month, 3 times         |

### How Recurring Schedules Work

1. **Parent schedule** created with `recurrenceRule`
2. **Child schedules** generated for each occurrence
3. Children linked via `parentScheduleId`
4. Each occurrence can be individually modified/cancelled

---

## Recent Changes & Fixes

### Schedule Creation Form (Simplified)

**Before**: Confusing options with "Days of Week", "Number of occurrences", technical RRULE concepts.

**After**:

- **Date range selection**: Two clear options
  - "Every day in range" → Creates daily sessions
  - "Repeat weekly" → Creates weekly sessions
- **Single date**: Simple "Repeat weekly" toggle with weeks count
- Submit button shows exactly how many sessions will be created

### RemoveEmptyInterceptor Fix

**Issue**: API responses missing `startTimeUtc`/`endTimeUtc` fields.

**Cause**: NestJS interceptor was treating Date objects as empty objects (since `Object.keys(new Date())` returns `[]`).

**Fix**: Added explicit Date detection in the interceptor before empty object check.

### Recurrence Count Fix

**Issue**: Selecting 2 days created 3 schedules.

**Cause**: `COUNT=2` was creating parent + 2 children (3 total).

**Fix**: Child count = `COUNT - 1` (parent is included in COUNT).

---

## Booking Flow

### Participant Books a Class

```
1. Participant views schedule (public page or search)
2. Clicks "Book"
3. System checks:
   - Is schedule cancelled? → Error
   - Already booked? → Error (or rebook if cancelled)
   - Capacity available? → BOOKED status
   - No capacity but waitlist available? → WAITLISTED status
   - Both full? → Error
4. Booking created with appropriate status
```

### Waitlist Auto-Promotion

When a booked participant cancels:

1. First waitlisted participant (by position) is promoted to BOOKED
2. Remaining waitlist positions are decremented
3. (TODO) Notification sent to promoted participant

---

## Tech Stack

### Frontend

- **Next.js 14** with App Router
- **React Query** for data fetching
- **FullCalendar** for calendar UI
- **Tailwind CSS** with OKLCH color system
- **shadcn/ui** components
- **next-intl** for i18n

### Backend

- **NestJS** with modular architecture
- **Prisma** ORM with PostgreSQL
- **Repository pattern** for data access
- **@nestjs-cls/transactional** for transactions
- Session-based authentication

---

## Next Steps

### High Priority

1. **Notifications System**

   - Email confirmations for bookings
   - Cancellation notifications
   - Waitlist promotion alerts
   - Reminder before class

2. **Public Booking Flow**

   - Public schedule discovery page
   - Booking without account (optional)
   - Payment integration (if classes are paid)

3. **Schedule Conflict Detection**
   - Warn when creating overlapping schedules
   - Prevent double-booking for participants

### Medium Priority

4. **Calendar Enhancements**

   - Drag-and-drop to reschedule
   - Resize to change duration
   - Show cancelled schedules with indicator

5. **Bulk Operations**

   - Cancel all future occurrences
   - Update all future occurrences

6. **Calendar Sync**
   - Export to Google Calendar / iCal
   - Subscribe URL for external calendars

### Lower Priority

7. **Schedule Templates**

   - Save common schedule patterns
   - Copy week to another week

8. **Analytics Dashboard**

   - Attendance rates
   - Popular classes/times
   - No-show tracking

9. **Participant Features**
   - Favorite classes/organizers
   - Booking history export
   - Reviews and ratings

---

## File Structure

```
apps/bibikos-api/src/app/modules/scheduling/
├── scheduling.module.ts           # Main module
├── app-users/                     # User profile management
├── organizers/                    # Organizer CRUD
├── participants/                  # Participant management
├── locations/                     # Location CRUD
├── classes/                       # Class CRUD
├── class-schedules/               # Schedule management
│   ├── class-schedule.controller.ts
│   ├── class-schedule.service.ts
│   ├── class-schedule.repository.ts
│   ├── class-schedule.repository.prisma.ts
│   └── dto/class-schedule.dto.ts
├── bookings/                      # Booking management
│   ├── booking.controller.ts
│   ├── booking.service.ts
│   ├── booking.repository.ts
│   └── dto/booking.dto.ts
└── onboarding/                    # Onboarding flow

apps/bibikos-client/app/(main)/
├── calendar/                      # Calendar page
│   ├── page.tsx
│   ├── calendar-content.tsx
│   ├── components/
│   │   ├── calendar-view.tsx
│   │   ├── schedule-form.tsx
│   │   ├── schedule-form-fields.tsx
│   │   ├── schedule-detail-sheet.tsx
│   │   └── ...
│   ├── hooks/
│   │   └── use-calendar-events.ts
│   └── utils/
│       └── schedule-utils.ts
├── classes/                       # Classes management
├── locations/                     # Locations management
├── bookings/                      # User bookings
├── dashboard/                     # Organizer dashboard
└── onboarding/                    # Setup wizard

apps/bibikos-client/lib/scheduling/
├── index.ts                       # Barrel exports
├── types.ts                       # TypeScript interfaces
├── queries.ts                     # React Query hooks
├── constants.ts                   # Shared constants
└── providers/
    └── scheduling-provider.tsx
```

---

## Testing Checklist

### Schedule Creation

- [ ] Single date → creates 1 schedule
- [ ] Date range (5 days) + "Every day" → creates 5 schedules
- [ ] Date range (2 weeks) + "Weekly" → creates correct number
- [ ] Schedule appears on calendar immediately

### Booking Flow

- [ ] Book class → status BOOKED
- [ ] Book full class → status WAITLISTED (if waitlist enabled)
- [ ] Cancel booking → status CANCELLED
- [ ] Cancel when waitlist exists → first waitlisted promoted

### Calendar UI

- [ ] Navigate months → correct schedules load
- [ ] Click schedule → detail sheet opens
- [ ] Filter by class → only selected shown
- [ ] Cancelled schedules → hidden (or shown with indicator)
