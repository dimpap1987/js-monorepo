'use client'

import { ScheduleCard } from '../../../../components/schedule-card'
import type { DiscoverClassGroup, DiscoverGroupedSchedule } from '../../../../lib/scheduling'
import { ClassGroupCard } from './class-group-card'

interface DiscoverDateGroupProps {
  title: string
  groups: DiscoverClassGroup[]
  onOpenTimeSlots: (group: DiscoverClassGroup) => void
  onBook: (group: DiscoverClassGroup, schedule: DiscoverGroupedSchedule) => void
  onCancel: (group: DiscoverClassGroup, schedule: DiscoverGroupedSchedule) => void
}

export function DiscoverDateGroup({ title, groups, onOpenTimeSlots, onBook, onCancel }: DiscoverDateGroupProps) {
  if (groups.length === 0) return null

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-5">
        {groups.map((group) => {
          // Single schedule - render as ScheduleCard
          if (group.schedules.length === 1) {
            const schedule = group.schedules[0]
            return (
              <ScheduleCard
                key={`${group.classId}-${schedule.id}`}
                schedule={{
                  id: schedule.id,
                  startTimeUtc: schedule.startTimeUtc,
                  endTimeUtc: schedule.endTimeUtc,
                  localTimezone: schedule.localTimezone,
                }}
                classId={group.classId}
                title={group.title}
                capacity={group.capacity}
                waitlistLimit={group.waitlistLimit}
                bookingCounts={schedule.bookingCounts}
                myBooking={schedule.myBooking}
                organizer={group.organizer}
                tags={group.tags}
                showClassLink={true}
                onBook={() => onBook(group, schedule)}
                onCancel={() => onCancel(group, schedule)}
                location={group.location ?? undefined}
              />
            )
          }

          // Multiple schedules - render as ClassGroupCard
          return (
            <ClassGroupCard
              key={`group-${group.classId}-${group.date}`}
              group={group}
              onClick={() => onOpenTimeSlots(group)}
            />
          )
        })}
      </div>
    </div>
  )
}
