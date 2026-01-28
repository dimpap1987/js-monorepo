'use client'

import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { Skeleton } from '@js-monorepo/components/ui/skeleton'
import { Calendar } from 'lucide-react'
import { useMemo } from 'react'
import { ScheduleCard } from '../../../../../components/schedule-card'
import type { OrganizerPublicSchedule } from '../../../../../lib/scheduling'
import { getDateGroup, toScheduleDisplayTimes, type DateGroup } from '../../../../../lib/datetime'

interface GroupedSchedules {
  today: OrganizerPublicSchedule[]
  tomorrow: OrganizerPublicSchedule[]
  thisWeek: OrganizerPublicSchedule[]
  later: OrganizerPublicSchedule[]
}

function groupSchedulesByDate(schedules: OrganizerPublicSchedule[]): GroupedSchedules {
  const groups: GroupedSchedules = {
    today: [],
    tomorrow: [],
    thisWeek: [],
    later: [],
  }

  for (const schedule of schedules) {
    const { start } = toScheduleDisplayTimes(schedule)
    const group: DateGroup = getDateGroup(start.date)
    groups[group].push(schedule)
  }

  return groups
}

const DATE_GROUP_CONFIG: { key: keyof GroupedSchedules; title: string }[] = [
  { key: 'today', title: 'Today' },
  { key: 'tomorrow', title: 'Tomorrow' },
  { key: 'thisWeek', title: 'This Week' },
  { key: 'later', title: 'Upcoming' },
]

function SchedulesListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Group header skeleton */}
      <Skeleton className="h-7 w-24" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Skeleton className="w-16 h-20 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-10 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function EmptySchedules() {
  return (
    <Card className="border-border/50 bg-muted/30">
      <CardContent className="py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Upcoming Classes</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          This instructor doesn&apos;t have any classes scheduled at the moment. Check back soon!
        </p>
      </CardContent>
    </Card>
  )
}

interface DateGroupSectionProps {
  title: string
  schedules: OrganizerPublicSchedule[]
  onBookSchedule: (schedule: OrganizerPublicSchedule) => void
  onCancelSchedule: (schedule: OrganizerPublicSchedule) => void
}

function DateGroupSection({ title, schedules, onBookSchedule, onCancelSchedule }: DateGroupSectionProps) {
  if (schedules.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground sticky top-0 bg-background/95 backdrop-blur-sm py-2 -mx-1 px-1">
        {title}
        <span className="ml-2 text-sm font-normal text-muted-foreground">({schedules.length})</span>
      </h3>
      <div className="grid gap-3">
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
            showClassLink={true}
            location={schedule.class?.location}
            onBook={() => onBookSchedule(schedule)}
            onCancel={() => onCancelSchedule(schedule)}
          />
        ))}
      </div>
    </div>
  )
}

interface InstructorSchedulesListProps {
  schedules: OrganizerPublicSchedule[] | undefined
  isLoading: boolean
  onBookSchedule: (schedule: OrganizerPublicSchedule) => void
  onCancelSchedule: (schedule: OrganizerPublicSchedule) => void
}

export function InstructorSchedulesList({
  schedules,
  isLoading,
  onBookSchedule,
  onCancelSchedule,
}: InstructorSchedulesListProps) {
  const groupedSchedules = useMemo(() => {
    if (!schedules || schedules.length === 0) return null
    return groupSchedulesByDate(schedules)
  }, [schedules])

  const hasSchedules = schedules && schedules.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Upcoming Classes</h2>
          {hasSchedules && <p className="text-sm text-muted-foreground mt-1">{schedules.length} classes available</p>}
        </div>
      </div>

      {isLoading ? (
        <SchedulesListSkeleton />
      ) : hasSchedules && groupedSchedules ? (
        <div className="space-y-8">
          {DATE_GROUP_CONFIG.map(({ key, title }) => (
            <DateGroupSection
              key={key}
              title={title}
              schedules={groupedSchedules[key]}
              onBookSchedule={onBookSchedule}
              onCancelSchedule={onCancelSchedule}
            />
          ))}
        </div>
      ) : (
        <EmptySchedules />
      )}
    </div>
  )
}
