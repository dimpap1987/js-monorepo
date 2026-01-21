'use client'

import { Badge } from '@js-monorepo/components/ui/badge'
import { Button } from '@js-monorepo/components/ui/button'
import { Card, CardContent, CardHeader } from '@js-monorepo/components/ui/card'
import { Separator } from '@js-monorepo/components/ui/separator'
import { cn } from '@js-monorepo/ui/util'
import { format, parseISO } from 'date-fns'
import { Calendar, Clock, Info, MessageSquare, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Booking, BookingStatus } from '../../../../lib/scheduling'
import { BOOKING_STATUS, BOOKING_STATUS_COLORS } from '../../../../lib/scheduling'
import { CancelBookingDialog } from './cancel-booking-dialog'

interface BookingCardEnhancedProps {
  booking: Booking
  isPastBooking?: boolean
  isCancelledSection?: boolean
}

function getStatusLabel(status: BookingStatus): string {
  switch (status) {
    case BOOKING_STATUS.BOOKED:
      return 'Confirmed'
    case BOOKING_STATUS.WAITLISTED:
      return 'Waitlisted'
    case BOOKING_STATUS.CANCELLED:
      return 'Cancelled'
    case BOOKING_STATUS.ATTENDED:
      return 'Attended'
    case BOOKING_STATUS.NO_SHOW:
      return 'Missed'
    default:
      return status
  }
}

export function BookingCardEnhanced({
  booking,
  isPastBooking = false,
  isCancelledSection = false,
}: BookingCardEnhancedProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const router = useRouter()

  const schedule = booking.classSchedule
  if (!schedule) return null

  const startTime = parseISO(schedule.startTimeUtc)
  const endTime = parseISO(schedule.endTimeUtc)
  const now = new Date()
  const isUpcoming = endTime >= now // Match backend logic: upcoming if class hasn't ended
  const canCancel = !isPastBooking && !isCancelledSection && booking.status === BOOKING_STATUS.BOOKED && isUpcoming
  const isInactive = isPastBooking || isCancelledSection
  const classId = schedule.class?.id
  const hasClassLink = !!classId
  const hasNotes = !!booking.organizerNotes

  const colors = BOOKING_STATUS_COLORS[booking.status]
  const statusLabel = getStatusLabel(booking.status)

  const handleCardClick = () => {
    if (hasClassLink && !isInactive) {
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
          hasClassLink && !isInactive && 'cursor-pointer hover:shadow-lg hover:border-primary/50 hover:bg-accent/50',
          isInactive && 'opacity-75'
        )}
        onClick={hasClassLink && !isInactive ? handleCardClick : undefined}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            {/* Date Badge */}
            <div className="flex-shrink-0">
              <div className={cn('rounded-lg p-3 text-center min-w-[60px]', isInactive ? 'bg-muted' : 'bg-primary/10')}>
                <div
                  className={cn(
                    'text-xs font-medium uppercase mb-1',
                    isInactive ? 'text-muted-foreground' : 'text-primary'
                  )}
                >
                  {format(startTime, 'MMM')}
                </div>
                <div className={cn('text-2xl font-bold', isInactive ? 'text-muted-foreground' : 'text-primary')}>
                  {format(startTime, 'd')}
                </div>
                <div className={cn('text-xs mt-1', isInactive ? 'text-muted-foreground' : 'text-primary/70')}>
                  {format(startTime, 'EEE')}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                <h3 className="text-lg font-semibold truncate">{schedule.class?.title || 'Class'}</h3>
                <div className="flex gap-2">
                  {/* Status Badges */}
                  {booking.status === BOOKING_STATUS.CANCELLED && booking.cancelledByOrganizer && (
                    <Badge variant="destructive" className="text-xs">
                      Cancelled by Instructor
                    </Badge>
                  )}
                  {booking.status === BOOKING_STATUS.CANCELLED && !booking.cancelledByOrganizer && (
                    <Badge variant="secondary" className="text-xs">
                      Cancelled by You
                    </Badge>
                  )}
                  <Badge variant="outline" className={cn('text-xs', colors.text, colors.border, colors.bg)}>
                    {statusLabel}
                    {booking.status === BOOKING_STATUS.WAITLISTED &&
                      booking.waitlistPosition &&
                      ` #${booking.waitlistPosition}`}
                  </Badge>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{format(startTime, 'EEEE, MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>
                    {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                  </span>
                </div>
              </div>

              {/* Cancel Reason */}
              {booking.status === BOOKING_STATUS.CANCELLED && booking.cancelReason && (
                <div className="mt-2 p-2 rounded-md bg-muted/50 border border-border/50">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {booking.cancelledByOrganizer ? 'Cancellation Reason' : 'Your Cancellation Reason'}
                      </p>
                      <p className="text-sm text-foreground">{booking.cancelReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Organizer Notes */}
              {hasNotes && (
                <div className="mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowNotes(!showNotes)
                    }}
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {showNotes ? 'Hide' : 'Show'} Instructor Notes
                  </Button>
                  {showNotes && (
                    <div className="mt-2 p-3 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50">
                      <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">Instructor Notes</p>
                      <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                        {booking.organizerNotes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <Separator className="mb-3" />
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Booked on {format(parseISO(booking.bookedAt), 'MMM d, yyyy')}
            </div>
            {canCancel && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={handleCancelClick}
                type="button"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel Booking
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <CancelBookingDialog booking={booking} open={cancelDialogOpen} onOpenChange={setCancelDialogOpen} />
    </>
  )
}
