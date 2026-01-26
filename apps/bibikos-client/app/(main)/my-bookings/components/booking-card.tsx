'use client'

import { Badge } from '@js-monorepo/components/ui/badge'
import { Button } from '@js-monorepo/components/ui/button'
import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { cn } from '@js-monorepo/ui/util'
import { isPast } from 'date-fns'
import { Calendar, Clock, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { DateBadge } from '../../../../components/date-badge'
import { formatDateWithDay, useDateTimeContext, useScheduleTime } from '../../../../lib/datetime'
import type { Booking, BookingStatus } from '../../../../lib/scheduling'
import { CancelBookingDialog } from './cancel-booking-dialog'

interface StatusConfig {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
}

const STATUS_CONFIG: Record<BookingStatus, StatusConfig> = {
  BOOKED: {
    label: 'Confirmed',
    variant: 'default',
    className: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
  WAITLISTED: {
    label: 'Waitlisted',
    variant: 'secondary',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  CANCELLED: {
    label: 'Cancelled',
    variant: 'destructive',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  ATTENDED: {
    label: 'Attended',
    variant: 'outline',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  NO_SHOW: {
    label: 'Missed',
    variant: 'destructive',
    className: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  },
}

interface BookingInfoProps {
  title: string
  dateWithDay: string
  timeRange: string
  status: BookingStatus
  waitlistPosition: number | null
  cancelledByOrganizer?: boolean
  cancelReason?: string | null
}

function BookingInfo({
  title,
  dateWithDay,
  timeRange,
  status,
  waitlistPosition,
  cancelledByOrganizer,
  cancelReason,
}: BookingInfoProps) {
  const statusConfig = STATUS_CONFIG[status]

  return (
    <div className="flex-1 min-w-0 space-y-1">
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="font-semibold truncate">{title}</h3>
        <Badge variant={statusConfig.variant} className={statusConfig.className}>
          {statusConfig.label}
          {status === 'WAITLISTED' && waitlistPosition && ` #${waitlistPosition}`}
        </Badge>
        {status === 'CANCELLED' && cancelledByOrganizer && (
          <Badge variant="outline" className="text-xs">
            By instructor
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>{dateWithDay}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{timeRange}</span>
        </div>
      </div>
      {status === 'CANCELLED' && cancelReason && (
        <p className="text-xs text-muted-foreground italic">Reason: {cancelReason}</p>
      )}
    </div>
  )
}

interface BookingCardProps {
  booking: Booking
  isPastBooking?: boolean
  isCancelledSection?: boolean
}

export function BookingCard({ booking, isPastBooking = false, isCancelledSection = false }: BookingCardProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const router = useRouter()

  const schedule = booking.classSchedule

  // Use the schedule time hook - must be called before any early returns
  const { times, timeRange, dateParts } = useScheduleTime(schedule)
  const { dateLocale } = useDateTimeContext()

  if (!schedule) return null

  const canCancel = !isPastBooking && !isCancelledSection && booking.status !== 'CANCELLED' && !isPast(times.start.date)
  const isInactive = isPastBooking || isCancelledSection
  const classId = schedule.class?.id
  const hasClassLink = !!classId
  const dateWithDay = formatDateWithDay(times.start.date, dateLocale)

  const handleCardClick = () => {
    if (hasClassLink) {
      router.push(`/class/${classId}`)
    }
  }

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCancelDialogOpen(true)
  }

  return (
    <>
      <Card
        className={cn(
          'border-border transition-all',
          hasClassLink && !isInactive && 'cursor-pointer hover:shadow-md hover:border-primary hover:bg-accent',
          isInactive && 'opacity-75'
        )}
        onClick={hasClassLink ? handleCardClick : undefined}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1 group">
              <DateBadge dateParts={dateParts} isPastBooking={isInactive} />
              <BookingInfo
                title={schedule.class?.title || 'Class'}
                dateWithDay={dateWithDay}
                timeRange={timeRange}
                status={booking.status}
                waitlistPosition={booking.waitlistPosition}
                cancelledByOrganizer={booking.cancelledByOrganizer}
                cancelReason={booking.cancelReason}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {canCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={handleCancelClick}
                  type="button"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <CancelBookingDialog booking={booking} open={cancelDialogOpen} onOpenChange={setCancelDialogOpen} />
    </>
  )
}
