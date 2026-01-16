import { Module } from '@nestjs/common'
import { AppUserModule } from './app-users/app-user.module'
import { BookingModule } from './bookings/booking.module'
import { ClassScheduleModule } from './class-schedules/class-schedule.module'
import { ClassModule } from './classes/class.module'
import { LocationModule } from './locations/location.module'
import { OnboardingModule } from './onboarding/onboarding.module'
import { OrganizerModule } from './organizers/organizer.module'
import { ParticipantModule } from './participants/participant.module'

/**
 * SchedulingModule - Class-based scheduling for individual instructors
 *
 * Phase 1 Features:
 * - Class creation & management
 * - Recurring schedules (RRULE)
 * - Participant booking & waitlist
 * - Attendance tracking
 *
 * Module Order (dependency-based):
 * 1. AppUserModule - Base user profiles
 * 2. OrganizerModule - Instructor profiles (depends on AppUser)
 * 3. ParticipantModule - Participant profiles (depends on AppUser)
 * 4. LocationModule - Physical/online venues (depends on Organizer)
 * 5. ClassModule - Class templates (depends on Organizer, Location)
 * 6. ClassScheduleModule - Specific occurrences (depends on Class, Location)
 * 7. BookingModule - Registrations (depends on Schedule, Participant)
 */
@Module({
  imports: [
    AppUserModule,
    OrganizerModule,
    ParticipantModule,
    LocationModule,
    ClassModule,
    OnboardingModule,
    ClassScheduleModule,
    BookingModule,
  ],
})
export class SchedulingModule {}
