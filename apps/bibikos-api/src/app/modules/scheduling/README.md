# Scheduling API Module

## Overview

The scheduling module provides a complete class booking system for individual instructors/coaches. It supports class management, schedule creation (one-time and recurring), and participant bookings.

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
└── bookings/                     # Participant registrations
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

| Method | Endpoint                         | Description               |
| ------ | -------------------------------- | ------------------------- |
| GET    | `/scheduling/classes`            | List organizer's classes  |
| GET    | `/scheduling/classes/:id`        | Get single class          |
| GET    | `/scheduling/classes/:id/public` | Get class for public view |
| POST   | `/scheduling/classes`            | Create class              |
| PATCH  | `/scheduling/classes/:id`        | Update class              |
| DELETE | `/scheduling/classes/:id`        | Deactivate class          |

### Class Schedules

| Method | Endpoint                                               | Description                             |
| ------ | ------------------------------------------------------ | --------------------------------------- |
| GET    | `/scheduling/schedules/calendar?startDate=X&endDate=Y` | Get schedules for date range            |
| GET    | `/scheduling/schedules/:id`                            | Get single schedule                     |
| GET    | `/scheduling/schedules/:id/public`                     | Get schedule for public view            |
| GET    | `/scheduling/schedules/class/:classId/upcoming`        | Get upcoming schedules                  |
| POST   | `/scheduling/schedules`                                | Create schedule (one-time or recurring) |
| PATCH  | `/scheduling/schedules/:id`                            | Update schedule                         |
| POST   | `/scheduling/schedules/:id/cancel`                     | Cancel schedule                         |
| DELETE | `/scheduling/schedules/:id/future`                     | Delete future occurrences               |

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

---

## Data Models

### Core Entities

```
AppUser (1) ─────────┬──────────── OrganizerProfile (0..1)
                     └──────────── ParticipantProfile (0..1)

OrganizerProfile (1) ────────────── Location (*)
                     └──────────── Class (*)

Class (1) ───────────────────────── ClassSchedule (*)

ClassSchedule (1) ───────────────── Booking (*)
ParticipantProfile (1) ──────────── Booking (*)
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

- [x] App user profile management
- [x] Organizer profile CRUD
- [x] Location CRUD
- [x] Class CRUD
- [x] One-time schedule creation
- [x] Recurring schedule creation (generates child occurrences)
- [x] Schedule cancellation
- [x] Calendar view endpoint (date range query)
- [x] Booking creation with capacity checking
- [x] Waitlist support
- [x] Attendance marking

### Pending ❌

- [ ] Waitlist auto-promotion on cancellation
- [ ] Schedule conflict detection
- [ ] Bulk schedule operations
- [ ] Email notifications
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

## Next Steps

### High Priority

1. **Real-time updates** - WebSocket events for schedule changes
2. **Email notifications** - Booking confirmations, reminders, cancellations
3. **Schedule conflicts** - Detect overlapping schedules for same class

### Medium Priority

4. **Bulk operations** - Update/cancel multiple schedules at once
5. **Waitlist auto-promotion** - Auto-book when spot opens
6. **Audit logging** - Track all schedule/booking changes

### Future Phases

- Phase 2: Staff management (instructors separate from organizers)
- Phase 3: Organization support (gyms, studios with multiple organizers)
- Phase 4: Payment integration
