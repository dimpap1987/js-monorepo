import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { Calendar } from 'lucide-react'
import { ScheduleCard } from '../../../../../components/schedule-card'
import type { ClassViewSchedule, ClassViewResponse } from '../../../../../lib/scheduling'

interface ClassSchedulesListProps {
  classData: ClassViewResponse
  onBookSchedule: (schedule: ClassViewSchedule) => void
  onCancelSchedule: (schedule: ClassViewSchedule) => void
}

function EmptySchedules() {
  return (
    <Card className="border-border">
      <CardContent className="py-16 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-foreground-muted opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No Upcoming Sessions</h3>
        <p className="text-foreground-muted max-w-md mx-auto">
          This class doesn&apos;t have any sessions scheduled at the moment. Check back soon!
        </p>
      </CardContent>
    </Card>
  )
}

export function ClassSchedulesList({ classData, onBookSchedule, onCancelSchedule }: ClassSchedulesListProps) {
  const { schedules } = classData

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Upcoming Sessions</h2>
      </div>

      {schedules.length > 0 ? (
        <div className="grid gap-4">
          {schedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              classId={classData.id}
              title={classData.title}
              capacity={classData.capacity}
              bookingCounts={schedule.bookingCounts}
              myBooking={schedule.myBooking}
              showClassLink={false}
              onBook={() => onBookSchedule(schedule)}
              onCancel={() => onCancelSchedule(schedule)}
            />
          ))}
        </div>
      ) : (
        <EmptySchedules />
      )}
    </div>
  )
}
