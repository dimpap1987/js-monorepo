'use client'

import type { DiscoverSchedule } from '../../../../lib/scheduling'
import { DiscoverScheduleCard } from './discover-schedule-card'

interface DiscoverDateGroupProps {
  title: string
  schedules: DiscoverSchedule[]
  onBook: (schedule: DiscoverSchedule) => void
}

export function DiscoverDateGroup({ title, schedules, onBook }: DiscoverDateGroupProps) {
  if (schedules.length === 0) return null

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-3">
        {schedules.map((schedule) => (
          <DiscoverScheduleCard key={schedule.id} schedule={schedule} onBook={onBook} />
        ))}
      </div>
    </div>
  )
}
