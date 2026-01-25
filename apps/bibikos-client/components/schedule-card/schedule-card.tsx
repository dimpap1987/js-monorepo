'use client'

import { Badge } from '@js-monorepo/components/ui/badge'
import { Button } from '@js-monorepo/components/ui/button'
import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { cn } from '@js-monorepo/ui/util'
import { isAfter, isBefore } from 'date-fns'
import { ArrowUpRight, CheckCircle2, ChevronRight, Clock, Radio, User, Users, X } from 'lucide-react'
import { useScheduleTime, type ScheduleDateParts } from '../../lib/datetime'

// =============================================================================
// Types
// =============================================================================

export interface ScheduleCardData {
  id: number
  startTimeUtc: string
  endTimeUtc: string
  localTimezone: string
}

export interface ScheduleCardProps {
  /** Schedule timing data */
  schedule: ScheduleCardData
  /** Class ID for navigation */
  classId: number
  /** Class title */
  title: string
  /** Max capacity (null = unlimited) */
  capacity: number | null
  /** Waitlist limit (0 or null = no waitlist) */
  waitlistLimit?: number | null
  /** Current booking counts */
  bookingCounts: {
    booked: number
    waitlisted: number
  }
  /** User's booking for this schedule */
  myBooking?: {
    id: number
    status: string
    waitlistPosition: number | null
  } | null
  /** Organizer info (optional - shown in discover, hidden in class detail) */
  organizer?: {
    displayName: string | null
    slug: string | null
  }
  /** Tags to display (optional) */
  tags?: Array<{ id: number; name: string }>
  /** Show link to class page */
  showClassLink?: boolean
  /** Called when user clicks Book/Join Waitlist */
  onBook: () => void
  /** Called when user clicks Cancel/Leave (optional - if not provided, no cancel button) */
  onCancel?: () => void
  /** Additional className for the card */
  className?: string
}

// =============================================================================
// Sub-components
// =============================================================================

function TimeBadge({ dateParts, className }: { dateParts: ScheduleDateParts; className?: string }) {
  return (
    <div className={cn('flex-shrink-0 w-16 text-center self-center', className)}>
      <div className="bg-primary/10 rounded-lg p-2 text-primary">
        <div className="text-xs font-medium uppercase">{dateParts.month}</div>
        <div className="text-2xl font-bold">{dateParts.day}</div>
        <div className="text-xs uppercase">{dateParts.dayOfWeek}</div>
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
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            hasWaitlist
              ? 'border-status-info bg-status-info-bg text-status-info'
              : 'border-destructive bg-destructive/10 text-destructive'
          )}
        >
          {hasWaitlist ? 'Waitlist available' : 'Full'}
        </Badge>
      ) : spotsLeft !== null && spotsLeft <= 3 ? (
        <Badge variant="outline" className="text-xs border-status-warning bg-status-warning-bg text-status-warning">
          {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
        </Badge>
      ) : null}
    </div>
  )
}

interface ScheduleInfoProps {
  classId: number
  title: string
  timeRange: string
  organizer?: {
    displayName: string | null
    slug: string | null
  }
  bookedCount: number
  capacity: number | null
  isFull: boolean
  hasWaitlist: boolean
  spotsLeft: number | null
  isHappeningNow: boolean
  tags?: Array<{ id: number; name: string }>
  showClassLink: boolean
}

function ScheduleInfo({
  classId,
  title,
  timeRange,
  organizer,
  bookedCount,
  capacity,
  isFull,
  hasWaitlist,
  spotsLeft,
  isHappeningNow,
  tags,
  showClassLink,
}: ScheduleInfoProps) {
  return (
    <div className="space-y-2 min-w-0">
      <div className="flex items-center gap-2 justify-between">
        {showClassLink ? (
          <DpNextNavLink
            href={`/class/${classId}`}
            className="group flex items-center gap-3 rounded-md py-1 px-2 hover:bg-muted cursor-pointer"
          >
            <h3 className="truncate group-hover:underline">{title}</h3>
            <ArrowUpRight className="w-4 h-4 bg-muted" />
          </DpNextNavLink>
        ) : (
          <h3 className="truncate font-semibold">{title}</h3>
        )}
        {isHappeningNow && (
          <Badge
            variant="outline"
            className="border-status-success/30 bg-status-success/10 text-status-success gap-1 animate-pulse"
          >
            <Radio className="w-5 h-5" />
            Live
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>{timeRange}</span>
        </div>
        {organizer?.displayName && (
          <div className="flex items-center gap-1.5 text-sm">
            <User className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
            {organizer.slug ? (
              <DpNextNavLink href={`/coach/${organizer.slug}`} className="hover:underline text-primary">
                {organizer.displayName}
              </DpNextNavLink>
            ) : (
              <span className="text-muted-foreground">{organizer.displayName}</span>
            )}
          </div>
        )}
      </div>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag.id} variant="default">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}
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
  isBooked: boolean
  isWaitlisted: boolean
  waitlistPosition: number | null
  onBook: () => void
  onCancel?: () => void
}

function BookButton({
  isFull,
  hasWaitlist,
  isBooked,
  isWaitlisted,
  waitlistPosition,
  onBook,
  onCancel,
}: BookButtonProps) {
  const handleBookClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onBook()
  }

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onCancel?.()
  }

  // User is already booked
  if (isBooked) {
    return (
      <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
        <Badge
          variant="outline"
          className="border-status-success bg-status-success-bg text-status-success gap-1 h-10 flex-1 justify-center"
        >
          <CheckCircle2 className="w-3 h-3" />
          Booked
        </Badge>
        {onCancel && (
          <Button
            variant="ghost"
            onClick={handleCancelClick}
            className="gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-1 h-10"
            type="button"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        )}
      </div>
    )
  }

  // User is on waitlist
  if (isWaitlisted) {
    return (
      <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
        <Badge
          variant="outline"
          className="border-status-warning bg-status-warning-bg text-status-warning gap-1 h-10 flex-1 justify-center"
        >
          <Clock className="w-3 h-3" />
          Waitlisted {waitlistPosition ? `#${waitlistPosition}` : ''}
        </Badge>
        {onCancel && (
          <Button
            variant="ghost"
            onClick={handleCancelClick}
            className="gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-1 h-10"
            type="button"
          >
            <X className="w-4 h-4" />
            Leave
          </Button>
        )}
      </div>
    )
  }

  // Default: show book button
  const isDisabled = isFull && !hasWaitlist
  const label = isFull ? (hasWaitlist ? 'Join Waitlist' : 'Full') : 'Book Now'

  return (
    <Button
      onClick={handleBookClick}
      disabled={isDisabled}
      variant={isFull && hasWaitlist ? 'secondary' : 'default'}
      className="gap-2 flex-shrink-0 w-full sm:w-auto"
      type="button"
    >
      {label}
      {!isDisabled && <ChevronRight className="w-4 h-4" />}
    </Button>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export function ScheduleCard({
  schedule,
  classId,
  title,
  capacity,
  waitlistLimit,
  bookingCounts,
  myBooking,
  organizer,
  tags,
  showClassLink = true,
  onBook,
  onCancel,
  className,
}: ScheduleCardProps) {
  const { times, timeRange, dateParts } = useScheduleTime(schedule)

  const bookedCount = bookingCounts?.booked || 0
  const isFull = capacity !== null ? bookedCount >= capacity : false
  const hasWaitlist = Boolean(waitlistLimit && waitlistLimit > 0)
  const spotsLeft = capacity !== null ? capacity - bookedCount : null

  // Check if class is happening now
  const now = new Date()
  const isHappeningNow = isAfter(now, times.start.date) && isBefore(now, times.end.date)

  // Check user's booking status
  const isBooked = myBooking?.status === 'BOOKED'
  const isWaitlisted = myBooking?.status === 'WAITLISTED'

  return (
    <Card
      className={cn('border-border transition-all hover:shadow-md hover:border-primary hover:bg-accent', className)}
    >
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-4 min-w-0">
            <TimeBadge dateParts={dateParts} />
            <ScheduleInfo
              classId={classId}
              title={title}
              timeRange={timeRange}
              organizer={organizer}
              bookedCount={bookedCount}
              capacity={capacity}
              isFull={isFull}
              hasWaitlist={hasWaitlist}
              spotsLeft={spotsLeft}
              isHappeningNow={isHappeningNow}
              tags={tags}
              showClassLink={showClassLink}
            />
          </div>
          <div className="w-full sm:w-auto px-5 mt-3">
            <BookButton
              isFull={isFull}
              hasWaitlist={hasWaitlist}
              isBooked={isBooked}
              isWaitlisted={isWaitlisted}
              waitlistPosition={myBooking?.waitlistPosition ?? null}
              onBook={onBook}
              onCancel={onCancel}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
