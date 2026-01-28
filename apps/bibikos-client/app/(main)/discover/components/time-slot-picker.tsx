'use client'

import { Badge } from '@js-monorepo/components/ui/badge'
import { Button } from '@js-monorepo/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@js-monorepo/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@js-monorepo/components/ui/drawer'
import { cn } from '@js-monorepo/ui/util'
import { CheckCircle2, Clock, MapPin, Users, X } from 'lucide-react'
import { useScheduleTime } from '../../../../lib/datetime'
import type { DiscoverClassGroup, DiscoverGroupedSchedule } from '../../../../lib/scheduling'

interface TimeSlotPickerProps {
  group: DiscoverClassGroup | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onBook: (schedule: DiscoverGroupedSchedule) => void
  onCancel: (schedule: DiscoverGroupedSchedule) => void
  isMobile: boolean
}

interface TimeSlotItemProps {
  schedule: DiscoverGroupedSchedule
  capacity: number | null
  waitlistLimit: number | null
  onBook: () => void
  onCancel: () => void
}

function TimeSlotItem({ schedule, capacity, waitlistLimit, onBook, onCancel }: TimeSlotItemProps) {
  const { timeRange } = useScheduleTime({
    id: schedule.id,
    startTimeUtc: schedule.startTimeUtc,
    endTimeUtc: schedule.endTimeUtc,
    localTimezone: schedule.localTimezone,
  })
  const bookingCounts = schedule.bookingCounts ?? { booked: 0, waitlisted: 0 }
  const bookedCount = bookingCounts.booked
  const isFull = capacity !== null ? bookedCount >= capacity : false
  const hasWaitlist = Boolean(waitlistLimit && waitlistLimit > 0)
  const spotsLeft = capacity !== null ? capacity - bookedCount : null

  const isBooked = schedule.myBooking?.status === 'BOOKED'
  const isWaitlisted = schedule.myBooking?.status === 'WAITLISTED'

  const handleBookClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onBook()
  }

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onCancel()
  }

  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b last:border-b-0">
      <div className="flex flex-col gap-2 min-w-0">
        {/* Time range */}
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>{timeRange}</span>
        </div>

        {/* Capacity info */}
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
      </div>

      {/* Action button */}
      <div className="flex-shrink-0">
        {isBooked ? (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-status-success bg-status-success-bg text-status-success gap-1 h-9"
            >
              <CheckCircle2 className="w-3 h-3" />
              Booked
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelClick}
              className="gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9"
              type="button"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : isWaitlisted ? (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-status-warning bg-status-warning-bg text-status-warning gap-1 h-9"
            >
              <Clock className="w-3 h-3" />#{schedule.myBooking?.waitlistPosition}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelClick}
              className="gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9"
              type="button"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleBookClick}
            disabled={isFull && !hasWaitlist}
            variant={isFull && hasWaitlist ? 'secondary' : 'default'}
            size="sm"
            className="h-9"
            type="button"
          >
            {isFull ? (hasWaitlist ? 'Waitlist' : 'Full') : 'Reserve Your Spot'}
          </Button>
        )}
      </div>
    </div>
  )
}

interface TimeSlotListProps {
  group: DiscoverClassGroup
  onBook: (schedule: DiscoverGroupedSchedule) => void
  onCancel: (schedule: DiscoverGroupedSchedule) => void
}

function TimeSlotList({ group, onBook, onCancel }: TimeSlotListProps) {
  // Sort schedules by start time
  const sortedSchedules = [...group.schedules].sort((a, b) => a.startTimeUtc.localeCompare(b.startTimeUtc))

  return (
    <div className="divide-y">
      {sortedSchedules.map((schedule) => (
        <TimeSlotItem
          key={schedule.id}
          schedule={schedule}
          capacity={group.capacity}
          waitlistLimit={group.waitlistLimit}
          onBook={() => onBook(schedule)}
          onCancel={() => onCancel(schedule)}
        />
      ))}
    </div>
  )
}

function PickerHeader({ group }: { group: DiscoverClassGroup }) {
  const firstSchedule = group.schedules[0]
  const { fullDate } = useScheduleTime({
    id: firstSchedule.id,
    startTimeUtc: firstSchedule.startTimeUtc,
    endTimeUtc: firstSchedule.endTimeUtc,
    localTimezone: firstSchedule.localTimezone,
  })

  return (
    <>
      <DialogTitle>{group.title}</DialogTitle>
      <DialogDescription asChild>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <span>{fullDate}</span>
          {group.location?.name && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {group.location.name}
            </span>
          )}
        </div>
      </DialogDescription>
    </>
  )
}

interface PickerContentProps {
  group: DiscoverClassGroup
  onBook: (schedule: DiscoverGroupedSchedule) => void
  onCancel: (schedule: DiscoverGroupedSchedule) => void
}

function PickerContent({ group, onBook, onCancel }: PickerContentProps) {
  return (
    <div className="max-h-[60vh] overflow-y-auto px-1">
      <TimeSlotList group={group} onBook={onBook} onCancel={onCancel} />
    </div>
  )
}

export function TimeSlotPickerDialog({
  group,
  open,
  onOpenChange,
  onBook,
  onCancel,
}: Omit<TimeSlotPickerProps, 'isMobile'>) {
  if (!group) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <PickerHeader group={group} />
        </DialogHeader>
        <PickerContent group={group} onBook={onBook} onCancel={onCancel} />
      </DialogContent>
    </Dialog>
  )
}

export function TimeSlotPickerDrawer({
  group,
  open,
  onOpenChange,
  onBook,
  onCancel,
}: Omit<TimeSlotPickerProps, 'isMobile'>) {
  if (!group) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-6">
        <DrawerHeader className="text-left px-0">
          <DrawerTitle>{group.title}</DrawerTitle>
          <DrawerDescription asChild>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              {group.location?.name && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {group.location.name}
                </span>
              )}
            </div>
          </DrawerDescription>
        </DrawerHeader>
        <PickerContent group={group} onBook={onBook} onCancel={onCancel} />
      </DrawerContent>
    </Drawer>
  )
}

export function TimeSlotPicker({ group, open, onOpenChange, onBook, onCancel, isMobile }: TimeSlotPickerProps) {
  if (!group) return null

  if (isMobile) {
    return (
      <TimeSlotPickerDrawer group={group} open={open} onOpenChange={onOpenChange} onBook={onBook} onCancel={onCancel} />
    )
  }

  return (
    <TimeSlotPickerDialog group={group} open={open} onOpenChange={onOpenChange} onBook={onBook} onCancel={onCancel} />
  )
}
