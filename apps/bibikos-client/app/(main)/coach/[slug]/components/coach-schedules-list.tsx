import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { Skeleton } from '@js-monorepo/components/ui/skeleton'
import { Calendar } from 'lucide-react'
import { CoachScheduleCard } from './coach-schedule-card'
import type { ClassSchedule } from '../../../../../lib/scheduling'

function SchedulesListSkeleton() {
  return (
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
  )
}

function EmptySchedules() {
  return (
    <Card className="border-border/50">
      <CardContent className="py-16 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-foreground-muted opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No Upcoming Classes</h3>
        <p className="text-foreground-muted max-w-md mx-auto">
          This coach doesn&apos;t have any classes scheduled at the moment. Check back soon!
        </p>
      </CardContent>
    </Card>
  )
}

interface CoachSchedulesListProps {
  schedules: ClassSchedule[] | undefined
  isLoading: boolean
  onBookSchedule: (schedule: ClassSchedule) => void
}

export function CoachSchedulesList({ schedules, isLoading, onBookSchedule }: CoachSchedulesListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Upcoming Classes</h2>
      </div>

      {isLoading ? (
        <SchedulesListSkeleton />
      ) : schedules && schedules.length > 0 ? (
        <div className="grid gap-4">
          {schedules.map((schedule) => (
            <CoachScheduleCard key={schedule.id} schedule={schedule} onBook={() => onBookSchedule(schedule)} />
          ))}
        </div>
      ) : (
        <EmptySchedules />
      )}
    </div>
  )
}
