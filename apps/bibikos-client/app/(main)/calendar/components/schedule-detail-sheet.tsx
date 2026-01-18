'use client'

import { Button } from '@js-monorepo/components/ui/button'
import { Badge } from '@js-monorepo/components/ui/badge'
import { Progress } from '@js-monorepo/components/ui/progress'
import { Separator } from '@js-monorepo/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@js-monorepo/components/ui/sheet'
import { Skeleton } from '@js-monorepo/components/ui/skeleton'
import { useNotifications } from '@js-monorepo/notification'
import { useTranslations } from 'next-intl'
import { format, parseISO, differenceInMinutes, isPast } from 'date-fns'
import {
  Clock,
  Users,
  Video,
  Building,
  Trash2,
  CalendarX,
  MapPin,
  Timer,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { ClassSchedule, Class, Booking, useBookingsForSchedule, useMarkAttendance } from '../../../../lib/scheduling'
import { BookingItem } from './booking-item'
import { getClassColor } from '../hooks/use-calendar-events'

interface ScheduleDetailSheetProps {
  schedule: ClassSchedule | null
  classInfo?: Class
  location?: { name: string; isOnline: boolean }
  onCancel: () => void
  onClose: () => void
}

export function ScheduleDetailSheet({ schedule, classInfo, location, onCancel, onClose }: ScheduleDetailSheetProps) {
  const tBookings = useTranslations('scheduling.bookings')
  const { addNotification } = useNotifications()

  // Hooks must be called unconditionally (before any returns)
  const { data: bookingsData, isLoading: isBookingsLoading } = useBookingsForSchedule(schedule?.id ?? 0)
  const markAttendanceMutation = useMarkAttendance()

  if (!schedule) return null

  const handleMarkAttendance = async (bookingIds: number[], status: 'ATTENDED' | 'NO_SHOW') => {
    try {
      await markAttendanceMutation.mutateAsync({ bookingIds, status })
      addNotification({
        message: `Marked as ${status === 'ATTENDED' ? 'attended' : 'no-show'}`,
        type: 'success',
      })
    } catch (error: any) {
      addNotification({
        message: error?.message || 'Failed to mark attendance',
        type: 'error',
      })
    }
  }

  const startTime = parseISO(schedule.startTimeUtc)
  const endTime = parseISO(schedule.endTimeUtc)
  const duration = differenceInMinutes(endTime, startTime)
  const isClassPast = isPast(endTime)
  const isClassInProgress = isPast(startTime) && !isClassPast

  // Calculate capacity utilization
  const booked = schedule.bookingCounts?.booked || 0
  const waitlisted = schedule.bookingCounts?.waitlisted || 0
  const capacity = classInfo?.capacity || 0
  const utilizationPercent = capacity > 0 ? Math.min((booked / capacity) * 100, 100) : 0
  const isNearCapacity = utilizationPercent >= 80
  const isFull = utilizationPercent >= 100

  // Get class color
  const classColor = getClassColor(schedule.classId)

  return (
    <Sheet open={!!schedule} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-lg overflow-y-auto p-0">
        {/* Header with color accent */}
        <div
          className="p-6 pb-4"
          style={{
            background: schedule.isCancelled
              ? 'linear-gradient(to bottom, color-mix(in oklch, var(--destructive) 10%, transparent), transparent)'
              : `linear-gradient(to bottom, color-mix(in oklch, ${classColor.bg} 15%, transparent), transparent)`,
          }}
        >
          <SheetHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <SheetTitle className="text-xl font-bold flex items-center gap-2 flex-wrap">
                  {!schedule.isCancelled && (
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: classColor.bg }} />
                  )}
                  {classInfo?.title || 'Class'}
                </SheetTitle>
                <SheetDescription className="text-base">{format(startTime, 'EEEE, MMMM d, yyyy')}</SheetDescription>
              </div>

              <div className="flex flex-col items-end gap-1">
                {schedule.isCancelled ? (
                  <Badge variant="destructive" className="gap-1">
                    <CalendarX className="w-3 h-3" />
                    Cancelled
                  </Badge>
                ) : isClassInProgress ? (
                  <Badge className="gap-1 bg-green-500 hover:bg-green-600">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    In Progress
                  </Badge>
                ) : isClassPast ? (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Completed
                  </Badge>
                ) : null}
              </div>
            </div>
          </SheetHeader>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* Time & Duration Card */}
          <div className="rounded-xl bg-background-secondary/50 border border-border/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">
                    {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                  </div>
                  <div className="text-xs text-foreground-muted">Local time</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-foreground-muted">
                <Timer className="w-4 h-4" />
                <span className="text-sm font-medium">{duration} min</span>
              </div>
            </div>

            {location && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${location.isOnline ? 'bg-purple-500/10' : 'bg-green-500/10'}`}>
                    {location.isOnline ? (
                      <Video className="w-4 h-4 text-purple-500" />
                    ) : (
                      <MapPin className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{location.name}</div>
                    <div className="text-xs text-foreground-muted">{location.isOnline ? 'Online' : 'In-person'}</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Capacity Card */}
          <div className="rounded-xl bg-background-secondary/50 border border-border/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-foreground-muted" />
                <span className="font-medium">Capacity</span>
              </div>
              <div className="flex items-center gap-2">
                {isFull && (
                  <Badge variant="destructive" className="text-xs gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Full
                  </Badge>
                )}
                {!isFull && isNearCapacity && (
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">
                    Almost full
                  </Badge>
                )}
              </div>
            </div>

            {capacity > 0 && (
              <div className="space-y-2">
                <Progress
                  value={utilizationPercent}
                  className="h-2"
                  style={
                    {
                      '--progress-background': isFull
                        ? 'oklch(0.577 0.245 27.325)'
                        : isNearCapacity
                          ? 'oklch(0.75 0.18 80)'
                          : 'oklch(0.65 0.18 150)',
                    } as React.CSSProperties
                  }
                />
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">
                    <span className="font-semibold text-foreground">{booked}</span> / {capacity} booked
                  </span>
                  {waitlisted > 0 && <span className="text-amber-600 font-medium">{waitlisted} waitlisted</span>}
                </div>
              </div>
            )}

            {!capacity && (
              <div className="text-sm text-foreground-muted">
                <span className="font-semibold text-foreground">{booked}</span> participants
                {waitlisted > 0 && <span className="text-amber-600 ml-2">({waitlisted} waitlisted)</span>}
              </div>
            )}
          </div>

          {/* Cancel Reason */}
          {schedule.isCancelled && schedule.cancelReason && (
            <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4">
              <div className="flex items-start gap-3">
                <CalendarX className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-destructive mb-1">Cancellation Reason</div>
                  <p className="text-sm text-foreground-secondary">{schedule.cancelReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Participants List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                {tBookings('participants')}
              </h3>
              {bookingsData?.bookings && bookingsData.bookings.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {bookingsData.bookings.length} total
                </Badge>
              )}
            </div>

            {isBookingsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : bookingsData?.bookings && bookingsData.bookings.length > 0 ? (
              <div className="space-y-2">
                {bookingsData.bookings.map((booking: Booking) => (
                  <BookingItem
                    key={booking.id}
                    booking={booking}
                    onMarkAttendance={handleMarkAttendance}
                    isPastClass={isClassPast}
                    isCancelled={schedule.isCancelled}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 rounded-xl bg-background-secondary/30 border border-border/30">
                <Users className="w-8 h-8 mx-auto text-foreground-muted/50 mb-2" />
                <p className="text-foreground-muted text-sm">No bookings yet</p>
                <p className="text-foreground-muted/70 text-xs mt-1">Participants will appear here when they book</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {!schedule.isCancelled && !isClassPast && (
            <div className="pt-4 border-t border-border">
              <Button variant="danger" onClick={onCancel} className="w-full gap-2">
                <Trash2 className="w-4 h-4" />
                Cancel Schedule
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
