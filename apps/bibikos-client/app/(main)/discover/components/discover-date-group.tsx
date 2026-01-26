'use client'

import { ScheduleCard } from '../../../../components/schedule-card'
import type { DiscoverSchedule } from '../../../../lib/scheduling'

interface DiscoverDateGroupProps {
  title: string
  schedules: DiscoverSchedule[]
  onBook: (schedule: DiscoverSchedule) => void
  onCancel: (schedule: DiscoverSchedule) => void
}

export function DiscoverDateGroup({ title, schedules, onBook, onCancel }: DiscoverDateGroupProps) {
  if (schedules.length === 0) return null

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-5">
        {schedules.map((schedule) => (
          <ScheduleCard
            key={schedule.id}
            schedule={schedule}
            classId={schedule.classId}
            title={schedule.class?.title || 'Class'}
            capacity={schedule.class?.capacity ?? null}
            waitlistLimit={schedule.class?.waitlistLimit}
            bookingCounts={schedule.bookingCounts ?? { booked: 0, waitlisted: 0 }}
            myBooking={schedule.myBooking}
            organizer={schedule.organizer}
            tags={schedule.tags}
            showClassLink={true}
            onBook={() => onBook(schedule)}
            onCancel={() => onCancel(schedule)}
            location={schedule.class?.location}
          />
        ))}
      </div>
    </div>
  )
}
