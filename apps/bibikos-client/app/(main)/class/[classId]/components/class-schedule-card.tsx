import { Button } from '@js-monorepo/components/ui/button'
import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { Badge } from '@js-monorepo/components/ui/badge'
import { Clock, Users, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { ClassViewSchedule } from '../../../../../lib/scheduling'

function DateBadge({ date }: { date: Date }) {
  return (
    <div className="flex-shrink-0 w-16 text-center">
      <div className="bg-primary/10 rounded-lg p-2">
        <div className="text-xs text-primary font-medium uppercase">{format(date, 'MMM')}</div>
        <div className="text-2xl font-bold text-primary">{format(date, 'd')}</div>
      </div>
    </div>
  )
}

interface CapacityBadgeProps {
  bookedCount: number
  capacity: number | null
  isFull: boolean
  spotsLeft: number | null
}

function CapacityBadge({ bookedCount, capacity, isFull, spotsLeft }: CapacityBadgeProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-foreground-muted">
      <div className="flex items-center gap-1.5">
        <Users className="w-4 h-4" />
        <span>
          {bookedCount}
          {capacity && ` / ${capacity}`}
        </span>
      </div>

      {isFull ? (
        <Badge variant="secondary" className="text-xs">
          Waitlist available
        </Badge>
      ) : (
        <Badge variant="secondary" className="text-xs text-green-600">
          {spotsLeft !== null ? `${spotsLeft} spots left` : 'Available'}
        </Badge>
      )}
    </div>
  )
}

interface ScheduleInfoProps {
  startTime: Date
  endTime: Date
  bookedCount: number
  capacity: number | null
  isFull: boolean
  spotsLeft: number | null
}

function ScheduleInfo({ startTime, endTime, bookedCount, capacity, isFull, spotsLeft }: ScheduleInfoProps) {
  return (
    <div className="space-y-1">
      <h3 className="font-semibold text-lg">{format(startTime, 'EEEE, MMMM d, yyyy')}</h3>
      <div className="flex items-center gap-1.5 text-sm text-foreground-muted">
        <Clock className="w-4 h-4" />
        <span>
          {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
        </span>
      </div>
      <CapacityBadge bookedCount={bookedCount} capacity={capacity} isFull={isFull} spotsLeft={spotsLeft} />
    </div>
  )
}

interface BookButtonProps {
  isFull: boolean
  onBook: () => void
}

function BookButton({ isFull, onBook }: BookButtonProps) {
  const label = isFull ? 'Join Waitlist' : 'Book Now'

  return (
    <Button onClick={onBook} className="gap-2">
      {label}
      <ChevronRight className="w-4 h-4" />
    </Button>
  )
}

interface ClassScheduleCardProps {
  schedule: ClassViewSchedule
  capacity: number | null
  onBook: () => void
}

export function ClassScheduleCard({ schedule, capacity, onBook }: ClassScheduleCardProps) {
  const startTime = parseISO(schedule.startTimeUtc)
  const endTime = parseISO(schedule.endTimeUtc)

  const bookedCount = schedule.bookingCounts?.booked || 0
  const isFull = capacity ? bookedCount >= capacity : false
  const spotsLeft = capacity ? capacity - bookedCount : null

  return (
    <Card className="border-border/50 hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-4">
            <DateBadge date={startTime} />
            <ScheduleInfo
              startTime={startTime}
              endTime={endTime}
              bookedCount={bookedCount}
              capacity={capacity}
              isFull={isFull}
              spotsLeft={spotsLeft}
            />
          </div>
          <BookButton isFull={isFull} onBook={onBook} />
        </div>
      </CardContent>
    </Card>
  )
}
