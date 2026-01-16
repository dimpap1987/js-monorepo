# Scheduling Module - Implementation Summary

## Overview

A class-based scheduling system for individual instructors (Phase 1). This module enables instructors to create and manage recurring group classes, handle participant bookings with waitlist support, and track attendance.

**Target Users (Phase 1):**

- Individual instructors / solo professionals
- NOT gyms or multi-staff organizations

---

## What Was Implemented

### Database Schema

Location: `libs/prisma/bibikos-db/src/lib/prisma/schema/scheduling.prisma`

| Model                | Purpose                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| `AppUser`            | Extended user profile linking to AuthUser, stores locale/timezone/country preferences             |
| `OrganizerProfile`   | Instructor-specific data: display name, bio, public slug, activity label, cancellation policy     |
| `ParticipantProfile` | Participant profile for booking & attendance tracking                                             |
| `Location`           | Physical or online venues with IANA timezone support                                              |
| `Class`              | Class template defining title, description, capacity, waitlist limits                             |
| `ClassSchedule`      | Specific class occurrences with RFC 5545 RRULE recurrence support                                 |
| `Booking`            | Participant registrations with status tracking (BOOKED, WAITLISTED, CANCELLED, ATTENDED, NO_SHOW) |

### API Modules

All modules located under: `apps/bibikos-api/src/app/modules/scheduling/`

#### 1. App Users (`/scheduling/app-users`)

- `GET /me` - Get or create current user's app profile
- `PATCH /me` - Update preferences (locale, timezone, countryCode)

#### 2. Organizers (`/scheduling/organizers`)

- `GET /me` - Get current user's organizer profile
- `POST /` - Create organizer profile (become an instructor)
- `PATCH /me` - Update organizer profile
- `GET /slug-check?slug=xxx` - Check if a public URL slug is available
- `GET /public/:slug` - Get public organizer profile (no auth required)

#### 3. Participants (`/scheduling/participants`)

- `GET /me` - Get current user's participant profile

#### 4. Locations (`/scheduling/locations`)

- `GET /` - List all locations for current organizer
- `GET /:id` - Get a specific location
- `POST /` - Create a new location
- `PATCH /:id` - Update a location
- `DELETE /:id` - Soft delete (deactivate) a location

#### 5. Classes (`/scheduling/classes`)

- `GET /` - List all classes for current organizer
- `GET /:id` - Get a specific class
- `GET /:id/public` - Get class for public view (no auth required)
- `POST /` - Create a new class
- `PATCH /:id` - Update a class
- `DELETE /:id` - Soft delete (deactivate) a class

#### 6. Class Schedules (`/scheduling/schedules`)

- `GET /calendar?startDate=&endDate=&classId=` - Get schedules for calendar view
- `GET /class/:classId/upcoming?limit=` - Get upcoming schedules for a class
- `GET /:id` - Get a specific schedule
- `GET /:id/public` - Get schedule for public view (no auth required)
- `POST /` - Create schedule(s) - supports RRULE for recurring
- `PATCH /:id` - Update a single schedule occurrence
- `POST /:id/cancel` - Cancel a schedule
- `DELETE /:id/future` - Delete future occurrences of a recurring schedule

#### 7. Bookings (`/scheduling/bookings`)

- `POST /` - Book a class (auto-handles waitlist)
- `GET /my` - Get current user's bookings (upcoming & past)
- `POST /:id/cancel` - Cancel a booking (participant)
- `GET /schedule/:scheduleId` - Get all bookings for a schedule (organizer view)
- `POST /:id/cancel-by-organizer` - Cancel a booking (organizer)
- `POST /attendance` - Mark attendance for multiple bookings
- `PATCH /:id/notes` - Update organizer notes on a booking

### Key Features Implemented

1. **Waitlist Logic**

   - Automatic placement on waitlist when class is full
   - Auto-promotion when spots open (cancellations)
   - Waitlist position tracking and reordering

2. **Recurring Schedules**

   - RFC 5545 RRULE support
   - Examples: `FREQ=WEEKLY;BYDAY=MO,WE,FR`, `FREQ=WEEKLY;INTERVAL=2;BYDAY=TU`
   - Auto-generates occurrences for 12 weeks ahead
   - Parent-child relationship for recurring instances

3. **Soft Capacity**

   - Optional flexible limits (recommendation vs hard limit)
   - `isCapacitySoft` flag on classes

4. **Public Pages Support**

   - Organizer public profile via slug (`/coach/:slug`)
   - Public class and schedule endpoints for booking pages

5. **Ownership Verification**

   - All endpoints verify organizer ownership before mutations
   - Participants can only manage their own bookings

6. **Transaction Support**
   - All mutations wrapped with `@Transactional()` decorator
   - Consistent state even on partial failures

---

## What Is NOT Implemented (Future Tasks)

### Phase 1 - Remaining Tasks

#### High Priority

- [ ] **Notifications**
- [ ] Booking confirmation notification
- [ ] Cancellation notification (to participant when organizer cancels)
- [ ] Waitlist promotion notification
- [ ] Class reminder notifications (before class starts)
- [ ] Schedule change/cancellation notification to all booked participants

#### Medium Priority

- [ ] **Public Booking Flow**

  - [ ] Endpoint for listing public classes by organizer slug
  - [ ] Endpoint for listing upcoming schedules for a public class

- [ ] **CSV Export**

  - [ ] Export attendance list for a schedule
  - [ ] Export participant list for an organizer
  - [ ] Export booking history

- [ ] **Check-In Mode**
  - [ ] QR code generation for schedules
  - [ ] Quick check-in endpoint (scan QR or tap name)

#### Lower Priority

- [ ] **Attendance Analytics** (simple list endpoints, no storage)

  - [ ] Attendance rate per class
  - [ ] No-show rate per participant
  - [ ] Class fill rate over time

- [ ] **Class Notes** (organizer private notes per class instance)

- [ ] **Booking Validation**
  - [ ] Prevent booking past classes
  - [ ] Cancellation deadline enforcement (based on organizer policy)

---

### Phase 2 - Payments (Not in Scope)

- [ ] Stripe integration for class payments
- [ ] Class pricing
- [ ] Subscription/package support
- [ ] Payment history

---

### Phase 3 - Organizations (Not in Scope)

- [ ] Organization/Gym model
- [ ] Multi-instructor support
- [ ] Staff roles & permissions
- [ ] Resource ownership (who owns classes)
- [ ] Billing per organization
- [ ] Data isolation per tenant

---

## File Structure

```
apps/bibikos-api/src/app/modules/scheduling/
├── IMPLEMENTATION.md          # This file
├── scheduling.module.ts       # Main module aggregating all sub-modules
├── index.ts                   # Public exports
│
├── app-users/
│   ├── app-user.module.ts
│   ├── app-user.controller.ts
│   ├── app-user.service.ts
│   ├── app-user.repository.ts
│   ├── app-user.repository.prisma.ts
│   ├── index.ts
│   └── dto/
│       └── app-user.dto.ts
│
├── organizers/
│   ├── organizer.module.ts
│   ├── organizer.controller.ts
│   ├── organizer.service.ts
│   ├── organizer.repository.ts
│   ├── organizer.repository.prisma.ts
│   ├── index.ts
│   └── dto/
│       └── organizer.dto.ts
│
├── participants/
│   ├── participant.module.ts
│   ├── participant.controller.ts
│   ├── participant.service.ts
│   ├── participant.repository.ts
│   ├── participant.repository.prisma.ts
│   ├── index.ts
│   └── dto/
│       └── participant.dto.ts
│
├── locations/
│   ├── location.module.ts
│   ├── location.controller.ts
│   ├── location.service.ts
│   ├── location.repository.ts
│   ├── location.repository.prisma.ts
│   ├── index.ts
│   └── dto/
│       └── location.dto.ts
│
├── classes/
│   ├── class.module.ts
│   ├── class.controller.ts
│   ├── class.service.ts
│   ├── class.repository.ts
│   ├── class.repository.prisma.ts
│   ├── index.ts
│   └── dto/
│       └── class.dto.ts
│
├── class-schedules/
│   ├── class-schedule.module.ts
│   ├── class-schedule.controller.ts
│   ├── class-schedule.service.ts
│   ├── class-schedule.repository.ts
│   ├── class-schedule.repository.prisma.ts
│   ├── index.ts
│   └── dto/
│       └── class-schedule.dto.ts
│
└── bookings/
    ├── booking.module.ts
    ├── booking.controller.ts
    ├── booking.service.ts
    ├── booking.repository.ts
    ├── booking.repository.prisma.ts
    ├── index.ts
    └── dto/
        └── booking.dto.ts
```

---

## Database Schema Location

`libs/prisma/bibikos-db/src/lib/prisma/schema/scheduling.prisma`

Updated `auth.prisma` to add `appUser` relation to `AuthUser` model.

---

## Commands

```bash
# Generate Prisma client after schema changes
pnpm db:bibikos:generate

# Create and apply database migration
pnpm db:bibikos:migrate

# Open Prisma Studio to view data
pnpm db:bibikos:studio

# Build the API
pnpm build:bibikos-api

# Run the API in development
pnpm dev:bibikos-api
```

---

## API Base Path

All scheduling endpoints are prefixed with `/scheduling/`:

- `/scheduling/app-users/*`
- `/scheduling/organizers/*`
- `/scheduling/participants/*`
- `/scheduling/locations/*`
- `/scheduling/classes/*`
- `/scheduling/schedules/*`
- `/scheduling/bookings/*`

---

## Architecture Notes

1. **Repository Pattern** - All database access through repository interfaces with Prisma implementations
2. **Dependency Injection** - Using NestJS DI with Symbol-based tokens
3. **Global Modules** - All scheduling modules are `@Global()` for easy cross-module access
4. **Transactional** - Using `@nestjs-cls/transactional` for transaction management
5. **Zod Validation** - DTOs validated with Zod schemas via `ZodPipe`
6. **Session Auth** - Using existing session-based auth with `LoggedInGuard` and `@SessionUser()`

---

## Notes for Future Development

1. **User Roles**: A single user can be both Organizer and Participant (coaches attending other classes)
2. **ID Strategy**: Uses Int autoincrement IDs to match existing AuthUser model
3. **Timestamps**: All times stored in UTC, displayed using location timezone
4. **Soft Deletes**: Locations and Classes use `isActive` flag instead of hard delete
5. **RRULE Parsing**: Basic implementation supports FREQ, INTERVAL, BYDAY, COUNT, UNTIL
