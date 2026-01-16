# Scheduling Module - Frontend Implementation

This document outlines the frontend implementation of the class-based scheduling system for individual instructors.

## Overview

The scheduling module provides a complete UI for fitness instructors, yoga teachers, and wellness coaches to manage their classes, schedules, and bookings. It integrates with the backend API implemented in `apps/bibikos-api/src/app/modules/scheduling/`.

## Architecture

```
apps/bibikos-client/
├── app/(main)/
│   ├── page.tsx                    # Landing page
│   ├── landing-page.tsx            # Landing page content
│   ├── dashboard/                  # Organizer dashboard
│   │   ├── page.tsx
│   │   └── dashboard-content.tsx
│   ├── onboarding/                 # New organizer setup
│   │   ├── page.tsx
│   │   └── onboarding-content.tsx
│   ├── locations/                  # Location management
│   │   ├── page.tsx
│   │   └── locations-content.tsx
│   ├── classes/                    # Class template management
│   │   ├── page.tsx
│   │   └── classes-content.tsx
│   ├── calendar/                   # Schedule calendar (FullCalendar)
│   │   ├── page.tsx
│   │   └── calendar-content.tsx
│   ├── bookings/                   # Participant bookings
│   │   ├── page.tsx
│   │   └── bookings-content.tsx
│   └── coach/[slug]/               # Public instructor profile
│       ├── page.tsx
│       └── coach-profile-content.tsx
├── lib/scheduling/
│   ├── index.ts                    # Barrel exports
│   ├── types.ts                    # TypeScript interfaces
│   ├── queries.ts                  # React Query hooks
│   └── constants.ts                # Static data (timezones, countries, etc.)
└── i18n/messages/en.json           # Translations
```

## Pages Implemented

### 1. Landing Page (`/`)

- Hero section with value proposition
- Feature highlights (6 key features)
- "How it Works" section (3 steps)
- Call-to-action sections
- Responsive design for all screen sizes

### 2. Dashboard (`/dashboard`)

- **Stats Overview**: Active classes, locations, weekly bookings
- **Quick Actions**: Create class, add schedule, view calendar
- **Today's Classes**: List of scheduled classes for the day
- **Auto-redirect**: Sends users without organizer profile to onboarding

### 3. Onboarding (`/onboarding`)

Multi-step wizard for new instructors:

- **Step 1 - Profile**: Display name, activity type (yoga, pilates, etc.), bio, custom URL slug
- **Step 2 - Location**: First teaching location (online or physical)
- **Step 3 - Class**: Optional first class creation

Features:

- Real-time slug availability checking
- Form validation with Zod schemas
- Progress indicator

### 4. Locations (`/locations`)

- Card grid of all locations
- Create/Edit modal with form validation
- Online vs. physical location toggle
- Timezone selection
- Active/inactive status management
- Delete confirmation dialog

### 5. Classes (`/classes`)

- Card grid of class templates
- Create/Edit modal
- Location assignment
- Capacity and waitlist configuration
- Soft capacity option (allow overbooking)
- Quick action to add schedule

### 6. Calendar (`/calendar`)

- **FullCalendar Integration**: Month, week, and list views
- **Create Schedule**: Click to add, with recurrence options
- **Schedule Detail Sheet**: View bookings, mark attendance
- **Recurrence Support**: Weekly, bi-weekly, custom days
- **Visual Indicators**: Booking counts on events

### 7. My Bookings (`/bookings`)

- Tabs for upcoming and past bookings
- Booking status badges (Booked, Waitlisted, Attended, etc.)
- Cancel booking functionality
- Empty states with helpful messaging

### 8. Public Coach Profile (`/coach/[slug]`)

- Public instructor profile page
- Display name, activity type, bio
- Upcoming class schedule (placeholder)
- Booking interface for participants

## Tech Stack

- **React Query**: Server state management with caching
- **React Hook Form + Zod**: Form handling and validation
- **FullCalendar**: Calendar visualization
- **date-fns**: Date manipulation
- **next-intl**: Internationalization
- **Tailwind CSS**: Styling
- **shadcn/ui**: UI components

## API Integration

All API calls are managed through React Query hooks in `lib/scheduling/queries.ts`:

```typescript
// Organizer hooks
useOrganizer()
useCreateOrganizer()
useUpdateOrganizer()
useCheckSlugAvailability()

// Location hooks
useLocations()
useCreateLocation()
useUpdateLocation()
useDeleteLocation()

// Class hooks
useClasses()
useCreateClass()
useUpdateClass()
useDeleteClass()

// Schedule hooks
useSchedulesCalendar(startDate, endDate)
useCreateSchedule()
useCancelSchedule()

// Booking hooks
useMyBookings()
useBookingsForSchedule(scheduleId)
useCreateBooking()
useCancelBooking()
useMarkAttendance()
```

## Routes Configuration

Protected routes are defined in `lib/routes-config.ts`:

| Route           | Role   | Description               |
| --------------- | ------ | ------------------------- |
| `/dashboard`    | USER   | Organizer dashboard       |
| `/onboarding`   | USER   | New organizer setup       |
| `/calendar`     | USER   | Schedule management       |
| `/classes`      | USER   | Class templates           |
| `/locations`    | USER   | Location management       |
| `/bookings`     | USER   | Participant bookings      |
| `/coach/[slug]` | PUBLIC | Public instructor profile |

## Translations

All UI text is externalized in `i18n/messages/en.json` under the `scheduling` namespace:

- `scheduling.dashboard.*`
- `scheduling.onboarding.*`
- `scheduling.locations.*`
- `scheduling.classes.*`
- `scheduling.schedules.*`
- `scheduling.calendar.*`
- `scheduling.bookings.*`
- `scheduling.profile.*`

---

## Future Features (Phase 2+)

### Payment Integration

- [ ] Stripe Connect for instructors
- [ ] Class pricing (per-class, packages, memberships)
- [ ] Payment processing at booking
- [ ] Refund handling for cancellations
- [ ] Invoice generation
- [ ] Payout management for instructors

### Participant Features

- [ ] Participant profile management
- [ ] Booking history with statistics
- [ ] Favorite instructors
- [ ] Class reviews and ratings
- [ ] Waitlist notifications (push/email)
- [ ] Calendar sync (Google Calendar, Apple Calendar)

### Organizer Features

- [ ] Analytics dashboard (attendance rates, revenue, trends)
- [ ] Bulk schedule management
- [ ] Class series/packages
- [ ] Custom cancellation policies
- [ ] Instructor availability calendar
- [ ] Client management (notes, history, tags)
- [ ] Export bookings/attendance to CSV

### Public Profile Enhancements

- [ ] Custom branding (colors, logo)
- [ ] Photo gallery
- [ ] Testimonials/reviews
- [ ] Social media links
- [ ] SEO optimization with dynamic metadata
- [ ] Shareable class links

### Communication

- [ ] Email notifications (booking confirmation, reminders, cancellations)
- [ ] SMS notifications (optional)
- [ ] In-app messaging between instructor and participants
- [ ] Announcement broadcasts to class participants

### Mobile Experience

- [ ] Progressive Web App (PWA) support
- [ ] Mobile-optimized calendar view
- [ ] Quick check-in via QR code
- [ ] Offline support for attendance marking

### Advanced Scheduling

- [ ] Recurring exceptions (skip specific dates)
- [ ] Holiday management
- [ ] Substitute instructor assignment
- [ ] Multi-location classes
- [ ] Private/invite-only classes
- [ ] Minimum participants threshold

### Phase 3: Multi-Tenant (Gyms/Studios)

- [ ] Organization accounts
- [ ] Multiple instructors per organization
- [ ] Room/resource booking
- [ ] Staff roles and permissions
- [ ] Unified billing for organizations
- [ ] White-label solution

---

## Development Notes

### Adding New Features

1. Add types to `lib/scheduling/types.ts`
2. Add API hooks to `lib/scheduling/queries.ts`
3. Add translations to `i18n/messages/en.json`
4. Create page components following existing patterns
5. Update routes in `lib/routes-config.ts` if needed

### Testing

- Unit tests for utility functions
- Integration tests for API hooks
- E2E tests for critical user flows (onboarding, booking)

### Performance Considerations

- React Query caching reduces API calls
- Calendar fetches data based on visible date range
- Skeleton loaders for perceived performance
- Lazy loading for non-critical components

---

## Related Documentation

- Backend Implementation: `apps/bibikos-api/src/app/modules/scheduling/IMPLEMENTATION.md`
- Database Schema: `libs/prisma/bibikos-db/src/lib/prisma/schema/scheduling.prisma`
