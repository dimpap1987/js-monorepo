# Calendar & Scheduling Feature

## Current Implementation Status

### Overview

The calendar feature allows organizers (coaches/instructors) to create and manage class schedules. Participants can view and book these schedules.

---

## API (bibikos-api)

### Implemented Endpoints

| Method | Endpoint                                        | Description                             | Status     |
| ------ | ----------------------------------------------- | --------------------------------------- | ---------- |
| GET    | `/scheduling/schedules/calendar`                | Get schedules for date range            | ✅ Working |
| GET    | `/scheduling/schedules/:id`                     | Get single schedule                     | ✅ Working |
| GET    | `/scheduling/schedules/:id/public`              | Get schedule for public view            | ✅ Working |
| GET    | `/scheduling/schedules/class/:classId/upcoming` | Get upcoming schedules for a class      | ✅ Working |
| POST   | `/scheduling/schedules`                         | Create schedule (one-time or recurring) | ✅ Working |
| PATCH  | `/scheduling/schedules/:id`                     | Update schedule                         | ✅ Working |
| POST   | `/scheduling/schedules/:id/cancel`              | Cancel schedule                         | ✅ Working |
| DELETE | `/scheduling/schedules/:id/future`              | Delete future occurrences               | ✅ Working |

### Key Files

- `apps/bibikos-api/src/app/modules/scheduling/class-schedules/class-schedule.controller.ts`
- `apps/bibikos-api/src/app/modules/scheduling/class-schedules/class-schedule.service.ts`
- `apps/bibikos-api/src/app/modules/scheduling/class-schedules/class-schedule.repository.prisma.ts`

### Data Model (Prisma)

```prisma
model ClassSchedule {
  id               Int       @id @default(autoincrement())
  classId          Int
  startTimeUtc     DateTime  @db.Timestamptz()
  endTimeUtc       DateTime  @db.Timestamptz()
  localTimezone    String    // Copied from location at creation
  recurrenceRule   String?   // RFC 5545 RRULE format
  occurrenceDate   String?   // YYYY-MM-DD for recurring
  parentScheduleId Int?      // Links child occurrences to parent
  isCancelled      Boolean   @default(false)
  cancelledAt      DateTime?
  cancelReason     String?
}
```

### Recurrence Support

- **RRULE Format**: RFC 5545 compatible
- **Examples**:
  - `FREQ=DAILY;COUNT=7` - Daily for 7 days
  - `FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=10` - Mon/Wed/Fri for 10 occurrences
  - `FREQ=WEEKLY;INTERVAL=2;BYDAY=TU;COUNT=5` - Every other Tuesday

---

## UI (bibikos-client)

### Implemented Features

#### Calendar View (`/calendar`)

- ✅ Monthly, weekly, and list views (responsive)
- ✅ Class color-coding (consistent per class)
- ✅ Capacity indicators (normal, near-capacity, full)
- ✅ Date selection for creating schedules
- ✅ Date range selection (drag to select multiple days)
- ✅ Class filtering (show/hide specific classes)
- ✅ Click event to view details

#### Schedule Creation

- ✅ Select class from dropdown
- ✅ Date and time selection
- ✅ Duration selection (30min to 2hrs)
- ✅ Recurrence options (none, daily, weekly, biweekly, monthly)
- ✅ Day-of-week selection for weekly recurrence
- ✅ Occurrence count
- ✅ Smart recurrence suggestions from date range selection

#### Schedule Detail Sheet

- ✅ View schedule information
- ✅ See booking counts
- ✅ Cancel schedule option

### Key Files

```
apps/bibikos-client/app/(main)/calendar/
├── page.tsx                    # Route entry point
├── calendar-content.tsx        # Main calendar logic
├── calendar.css                # FullCalendar custom styles
├── schemas.ts                  # Zod validation schemas
├── types.ts                    # TypeScript types
├── components/
│   ├── calendar-view.tsx       # FullCalendar wrapper
│   ├── calendar-header.tsx     # Header with actions
│   ├── calendar-skeleton.tsx   # Loading state
│   ├── calendar-no-classes-warning.tsx
│   ├── class-legend.tsx        # Class filter/legend
│   ├── schedule-form.tsx       # Create schedule dialog
│   ├── schedule-form-fields.tsx
│   ├── schedule-detail-sheet.tsx
│   └── cancel-schedule-dialog.tsx
├── hooks/
│   └── use-calendar-events.ts  # Transform schedules to calendar events
└── utils/
    └── schedule-utils.ts       # Recurrence rule builder
```

### React Query Hooks

```typescript
// Fetching
useSchedulesCalendar(startDate, endDate, classId?)
useUpcomingSchedules(classId, limit?)
useSchedule(id)
useSchedulePublic(id)

// Mutations
useCreateSchedule()
useUpdateSchedule()
useCancelSchedule()
useDeleteFutureSchedules()
```

---

## Known Issues / Bugs (Fixed)

### 1. Schedules Not Appearing - Missing startTimeUtc/endTimeUtc (FIXED)

**Symptom**: User creates a schedule, API returns schedules, but calendar shows nothing.

**Root Cause**: The `RemoveEmptyInterceptor` was treating `Date` objects as regular objects. Since `Object.entries(new Date())` returns `[]`, Date values were being removed from the API response.

**Fix Applied**: `libs/nest-utils/src/lib/interceptors/remove-empty.interceptor.ts` now checks for `Date` instances and returns them as-is.

**Debug Steps** (if issue recurs):

1. Check browser Network tab for `/scheduling/schedules/calendar` response
2. Verify the response includes `startTimeUtc` and `endTimeUtc` fields
3. If missing, check the `RemoveEmptyInterceptor`

### 2. Timezone Handling

**Current Behavior**:

- Schedules are stored in UTC
- Frontend converts local time to UTC when creating
- `localTimezone` is copied from the class's location

**Potential Issue**: Date strings like `new Date('2026-01-16T09:00')` are parsed as local time, which may cause confusion.

---

## Next Steps

### API Improvements

#### High Priority

1. **Add cancelled schedules to calendar response** (optional flag)

   - Currently `isCancelled: false` filter excludes cancelled schedules
   - Should show cancelled schedules with visual indicator

2. **Bulk schedule operations**

   - Update all future occurrences
   - Cancel all future occurrences with single call

3. **Schedule conflict detection**
   - Warn when creating overlapping schedules
   - Prevent double-booking for participants

#### Medium Priority

4. **Waitlist auto-promotion**

   - When booking is cancelled, auto-promote from waitlist
   - Send notification to promoted participant

5. **Schedule templates**

   - Save and reuse common schedule patterns
   - Copy schedules to different weeks

6. **Reminders & notifications**
   - Email/push notifications before class
   - Cancellation notifications to participants

### UI Improvements

#### High Priority

1. **Real-time calendar updates**

   - WebSocket subscription for schedule changes
   - Optimistic UI updates

2. **Drag-and-drop schedule editing**

   - Move schedules to different times
   - Resize to change duration

3. **Better loading states**
   - Skeleton for individual events
   - Optimistic creation (show immediately, confirm later)

#### Medium Priority

4. **Recurring schedule editing**

   - Edit single occurrence vs all future
   - Visual indicator for recurring events

5. **Calendar sync**

   - Export to Google Calendar / iCal
   - Subscribe URL for external calendars

6. **Participant view**
   - Public calendar for organizer's classes
   - Booking flow integration

### Database/Schema

1. **Add indexes for performance**

   ```prisma
   @@index([startTimeUtc, endTimeUtc])
   @@index([classId, startTimeUtc])
   ```

2. **Schedule history/audit log**
   - Track changes to schedules
   - Who cancelled, when, why

---

## Testing Checklist

### Manual Testing

- [ ] Create one-time schedule → appears on calendar
- [ ] Create weekly recurring schedule → all occurrences appear
- [ ] Cancel schedule → removed from calendar (or shown as cancelled)
- [ ] Change calendar view (month/week/list) → events persist
- [ ] Navigate to different months → correct schedules load
- [ ] Filter by class → only selected classes shown
- [ ] Date range selection → smart recurrence suggestion

### API Testing

```bash
# Get schedules for January 2026
curl -X GET "http://localhost:3000/scheduling/schedules/calendar?startDate=2026-01-01&endDate=2026-02-01"

# Create a one-time schedule
curl -X POST "http://localhost:3000/scheduling/schedules" \
  -H "Content-Type: application/json" \
  -d '{
    "classId": 1,
    "startTimeUtc": "2026-01-20T10:00:00Z",
    "endTimeUtc": "2026-01-20T11:00:00Z"
  }'

# Create recurring schedule
curl -X POST "http://localhost:3000/scheduling/schedules" \
  -H "Content-Type: application/json" \
  -d '{
    "classId": 1,
    "startTimeUtc": "2026-01-20T10:00:00Z",
    "endTimeUtc": "2026-01-20T11:00:00Z",
    "recurrenceRule": "FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=10"
  }'
```

---

## Architecture Notes

### Why UTC Storage?

- Consistent across timezones
- Easier date math
- `localTimezone` stored for display purposes

### Why Parent-Child Schedule Relationship?

- Recurring schedules create one parent + N children
- Allows individual occurrence modifications
- Supports "edit single" vs "edit all" patterns

### FullCalendar Integration

- Using `@fullcalendar/react` v6.1.20
- Plugins: daygrid, timegrid, interaction, list
- Custom CSS in `calendar.css` using OKLCH colors
