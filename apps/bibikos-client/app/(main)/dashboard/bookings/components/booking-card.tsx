'use client'

import { Badge } from '@js-monorepo/components/ui/badge'
import { Button } from '@js-monorepo/components/ui/button'
import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { Label } from '@js-monorepo/components/ui/label'
import { cn } from '@js-monorepo/ui/util'
import { format, isFuture, parseISO } from 'date-fns'
import { Calendar, Clock, Edit, User } from 'lucide-react'
import { BOOKING_STATUS, BOOKING_STATUS_COLORS } from '../../../../../lib/scheduling'
import type { BookingCardProps } from '../types'

export function BookingCard({ booking, onViewDetails, onToggleAttendance, isMarkingAttendance }: BookingCardProps) {
  const colors = BOOKING_STATUS_COLORS[booking.status]
  const schedule = booking.classSchedule
  const participant = booking.participant
  const isUpcoming = schedule ? isFuture(parseISO(schedule.startTimeUtc)) : false

  if (!schedule) return null

  const startTime = parseISO(schedule.startTimeUtc)
  const canMarkAttendance =
    isUpcoming && (booking.status === BOOKING_STATUS.BOOKED || booking.status === BOOKING_STATUS.WAITLISTED)

  return (
    <Card className={cn('border-border/50 transition-all hover:shadow-md', !isUpcoming && 'opacity-75')}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Participant Avatar/Initial */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>

          {/* Booking Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">
                  {participant?.appUser?.authUser?.firstName && participant?.appUser?.authUser?.lastName
                    ? `${participant.appUser.authUser.firstName} ${participant.appUser.authUser.lastName}`
                    : participant?.appUser?.authUser?.username || 'Unknown Participant'}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-foreground-muted">
                    <Calendar className="w-4 h-4" />
                    <span>{format(startTime, 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-foreground-muted">
                    <Clock className="w-4 h-4" />
                    <span>{format(startTime, 'h:mm a')}</span>
                  </div>
                  <div className="text-foreground-muted">{schedule.class?.title}</div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className={cn('text-xs', colors.text, colors.border, colors.bg)}>
                    {booking.status === BOOKING_STATUS.BOOKED && 'Booked'}
                    {booking.status === BOOKING_STATUS.WAITLISTED && 'Waitlisted'}
                    {booking.status === BOOKING_STATUS.CANCELLED && 'Cancelled'}
                    {booking.status === BOOKING_STATUS.ATTENDED && 'Attended'}
                    {booking.status === BOOKING_STATUS.NO_SHOW && 'No Show'}
                  </Badge>
                  {booking.status === BOOKING_STATUS.WAITLISTED && booking.waitlistPosition && (
                    <span className="text-xs text-foreground-muted">Position #{booking.waitlistPosition}</span>
                  )}
                  {booking.organizerNotes && (
                    <Badge variant="secondary" className="text-xs">
                      <Edit className="w-3 h-3 mr-1" />
                      Has Notes
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {canMarkAttendance && onToggleAttendance && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={booking.status === 'ATTENDED'}
                      onChange={(e) => onToggleAttendance(booking.id, e.target.checked)}
                      disabled={isMarkingAttendance}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
                    />
                    <Label>Attended</Label>
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={onViewDetails}>
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
