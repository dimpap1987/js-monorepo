'use client'

import { useState } from 'react'
import { Button } from '@js-monorepo/components/ui/button'
import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { Badge } from '@js-monorepo/components/ui/badge'
import { format, parseISO, isPast } from 'date-fns'
import { Calendar, Clock, X } from 'lucide-react'
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

interface DateBadgeProps {
  date: Date
  isPastBooking: boolean
}

function DateBadge({ date, isPastBooking }: DateBadgeProps) {
  return (
    <div className="flex-shrink-0 w-14 text-center">
      <div className={`rounded-lg p-2 ${isPastBooking ? 'bg-muted' : 'bg-primary/10'}`}>
        <div className={`text-xs font-medium uppercase ${isPastBooking ? 'text-muted-foreground' : 'text-primary'}`}>
          {format(date, 'MMM')}
        </div>
        <div className={`text-xl font-bold ${isPastBooking ? 'text-muted-foreground' : 'text-primary'}`}>
          {format(date, 'd')}
        </div>
      </div>
    </div>
  )
}

interface BookingInfoProps {
  title: string
  startTime: Date
  endTime: Date
  status: BookingStatus
  waitlistPosition: number | null
  cancelledByOrganizer?: boolean
  cancelReason?: string | null
}

function BookingInfo({
  title,
  startTime,
  endTime,
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
          <span>{format(startTime, 'EEEE, MMM d')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>
            {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
          </span>
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

  const schedule = booking.classSchedule
  if (!schedule) return null

  const startTime = parseISO(schedule.startTimeUtc)
  const endTime = parseISO(schedule.endTimeUtc)
  const canCancel = !isPastBooking && !isCancelledSection && booking.status !== 'CANCELLED' && !isPast(startTime)
  const isInactive = isPastBooking || isCancelledSection

  return (
    <>
      <Card className={`border-border/50 ${isInactive ? 'opacity-75' : 'hover:shadow-md'} transition-all`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <DateBadge date={startTime} isPastBooking={isInactive} />
              <BookingInfo
                title={schedule.class?.title || 'Class'}
                startTime={startTime}
                endTime={endTime}
                status={booking.status}
                waitlistPosition={booking.waitlistPosition}
                cancelledByOrganizer={booking.cancelledByOrganizer}
                cancelReason={booking.cancelReason}
              />
            </div>
            {canCancel && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setCancelDialogOpen(true)}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <CancelBookingDialog booking={booking} open={cancelDialogOpen} onOpenChange={setCancelDialogOpen} />
    </>
  )
}
