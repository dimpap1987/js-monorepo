'use client'

import { Button } from '@js-monorepo/components/ui/button'
import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { Badge } from '@js-monorepo/components/ui/badge'
import { Clock, Users, ChevronRight } from 'lucide-react'
import type { ClassSchedule } from '../../../../../lib/scheduling'
import { useScheduleTime, type ScheduleDateParts } from '../../../../../lib/datetime'

function DateBadge({ dateParts }: { dateParts: ScheduleDateParts }) {
  return (
    <div className="flex-shrink-0 w-16 text-center">
      <div className="bg-primary/10 rounded-lg p-2">
        <div className="text-xs text-primary font-medium uppercase">{dateParts.month}</div>
        <div className="text-2xl font-bold text-primary">{dateParts.day}</div>
      </div>
    </div>
  )
}

interface CapacityBadgeProps {
  bookedCount: number
  capacity: number | null
  isFull: boolean
  hasWaitlist: boolean
  spotsLeft: number | null
}

function CapacityBadge({ bookedCount, capacity, isFull, hasWaitlist, spotsLeft }: CapacityBadgeProps) {
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
          {hasWaitlist ? 'Waitlist available' : 'Full'}
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
  title: string
  timeRange: string
  bookedCount: number
  capacity: number | null
  isFull: boolean
  hasWaitlist: boolean
  spotsLeft: number | null
}

function ScheduleInfo({ title, timeRange, bookedCount, capacity, isFull, hasWaitlist, spotsLeft }: ScheduleInfoProps) {
  return (
    <div className="space-y-1">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="flex items-center gap-1.5 text-sm text-foreground-muted">
        <Clock className="w-4 h-4" />
        <span>{timeRange}</span>
      </div>
      <CapacityBadge
        bookedCount={bookedCount}
        capacity={capacity}
        isFull={isFull}
        hasWaitlist={hasWaitlist}
        spotsLeft={spotsLeft}
      />
    </div>
  )
}

interface BookButtonProps {
  isFull: boolean
  hasWaitlist: boolean
  onBook: () => void
}

function BookButton({ isFull, hasWaitlist, onBook }: BookButtonProps) {
  const isDisabled = isFull && !hasWaitlist
  const label = isFull ? (hasWaitlist ? 'Join Waitlist' : 'Full') : 'Book Now'

  return (
    <Button onClick={onBook} disabled={isDisabled} className="gap-2">
      {label}
      <ChevronRight className="w-4 h-4" />
    </Button>
  )
}

interface CoachScheduleCardProps {
  schedule: ClassSchedule
  onBook: () => void
}

export function CoachScheduleCard({ schedule, onBook }: CoachScheduleCardProps) {
  const { timeRange, dateParts } = useScheduleTime(schedule)
  const classInfo = schedule.class
  const bookingCounts = schedule.bookingCounts

  const bookedCount = bookingCounts?.booked || 0
  const capacity = classInfo?.capacity ?? null
  const isFull = capacity ? bookedCount >= capacity : false
  const hasWaitlist = !!(classInfo?.waitlistLimit && classInfo.waitlistLimit > 0)
  const spotsLeft = capacity ? capacity - bookedCount : null

  return (
    <Card className="border-border/50 hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-4">
            <DateBadge dateParts={dateParts} />
            <ScheduleInfo
              title={classInfo?.title || 'Class'}
              timeRange={timeRange}
              bookedCount={bookedCount}
              capacity={capacity}
              isFull={isFull}
              hasWaitlist={hasWaitlist}
              spotsLeft={spotsLeft}
            />
          </div>
          <BookButton isFull={isFull} hasWaitlist={hasWaitlist} onBook={onBook} />
        </div>
      </CardContent>
    </Card>
  )
}
