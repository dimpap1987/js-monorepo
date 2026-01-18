'use client'

import { Button } from '@js-monorepo/components/ui/button'
import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { Badge } from '@js-monorepo/components/ui/badge'
import { Clock, Users, ChevronRight, User } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import type { DiscoverSchedule } from '../../../../lib/scheduling'

interface TimeBadgeProps {
  startTime: Date
  endTime: Date
}

function TimeBadge({ startTime, endTime }: TimeBadgeProps) {
  return (
    <div className="flex-shrink-0 w-16 text-center">
      <div className="bg-primary/10 rounded-lg p-2">
        <div className="text-xs text-primary font-medium uppercase">{format(startTime, 'MMM')}</div>
        <div className="text-2xl font-bold text-primary">{format(startTime, 'd')}</div>
      </div>
    </div>
  )
}

interface CapacityInfoProps {
  bookedCount: number
  capacity: number | null
  isFull: boolean
  hasWaitlist: boolean
  spotsLeft: number | null
}

function CapacityInfo({ bookedCount, capacity, isFull, hasWaitlist, spotsLeft }: CapacityInfoProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
      ) : spotsLeft !== null && spotsLeft <= 3 ? (
        <Badge variant="secondary" className="text-xs text-orange-600">
          {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
        </Badge>
      ) : null}
    </div>
  )
}

interface ScheduleInfoProps {
  title: string
  startTime: Date
  endTime: Date
  organizerName: string | null
  organizerSlug: string | null
  bookedCount: number
  capacity: number | null
  isFull: boolean
  hasWaitlist: boolean
  spotsLeft: number | null
}

function ScheduleInfo({
  title,
  startTime,
  endTime,
  organizerName,
  organizerSlug,
  bookedCount,
  capacity,
  isFull,
  hasWaitlist,
  spotsLeft,
}: ScheduleInfoProps) {
  return (
    <div className="space-y-1 min-w-0">
      <h3 className="font-semibold text-lg truncate">{title}</h3>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>
            {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
          </span>
        </div>
        {organizerName && (
          <div className="flex items-center gap-1.5 text-sm">
            <User className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
            {organizerSlug ? (
              <DpNextNavLink href={`/coach/${organizerSlug}`} className="hover:underline text-primary">
                {organizerName}
              </DpNextNavLink>
            ) : (
              <span className="text-muted-foreground">{organizerName}</span>
            )}
          </div>
        )}
      </div>
      <CapacityInfo
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
    <Button onClick={onBook} disabled={isDisabled} className="gap-2 flex-shrink-0">
      {label}
      <ChevronRight className="w-4 h-4" />
    </Button>
  )
}

interface DiscoverScheduleCardProps {
  schedule: DiscoverSchedule
  onBook: (schedule: DiscoverSchedule) => void
}

export function DiscoverScheduleCard({ schedule, onBook }: DiscoverScheduleCardProps) {
  const startTime = parseISO(schedule.startTimeUtc)
  const endTime = parseISO(schedule.endTimeUtc)
  const classInfo = schedule.class
  const bookingCounts = schedule.bookingCounts

  const bookedCount = bookingCounts?.booked || 0
  const capacity = classInfo?.capacity ?? null
  const isFull = capacity !== null ? bookedCount >= capacity : false
  const hasWaitlist = Boolean(classInfo?.waitlistLimit && classInfo.waitlistLimit > 0)
  const spotsLeft = capacity !== null ? capacity - bookedCount : null

  return (
    <Card className="border-border/50 hover:shadow-md transition-all">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-4 min-w-0">
            <TimeBadge startTime={startTime} endTime={endTime} />
            <ScheduleInfo
              title={classInfo?.title || 'Class'}
              startTime={startTime}
              endTime={endTime}
              organizerName={schedule.organizer?.displayName}
              organizerSlug={schedule.organizer?.slug}
              bookedCount={bookedCount}
              capacity={capacity}
              isFull={isFull}
              hasWaitlist={hasWaitlist}
              spotsLeft={spotsLeft}
            />
          </div>
          <BookButton isFull={isFull} hasWaitlist={hasWaitlist} onBook={() => onBook(schedule)} />
        </div>
      </CardContent>
    </Card>
  )
}
