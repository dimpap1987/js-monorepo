'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { DpButton } from '@js-monorepo/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@js-monorepo/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@js-monorepo/components/ui/tabs'
import { Badge } from '@js-monorepo/components/ui/badge'
import { Skeleton } from '@js-monorepo/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@js-monorepo/components/ui/alert-dialog'
import { useNotifications } from '@js-monorepo/notification'
import { cn } from '@js-monorepo/ui/util'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Calendar, Clock, MapPin, Video, Building, X, CalendarOff, Users } from 'lucide-react'
import { format, parseISO, isPast, isFuture } from 'date-fns'
import { useMyBookings, useCancelBooking, Booking, BOOKING_STATUS_COLORS } from '../../../lib/scheduling'

function BookingsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-64 mt-2" />
      </div>

      <Skeleton className="h-10 w-full max-w-md" />

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Skeleton className="w-16 h-20 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function BookingCard({
  booking,
  onCancel,
  showCancel = false,
}: {
  booking: Booking
  onCancel?: () => void
  showCancel?: boolean
}) {
  const t = useTranslations('scheduling.bookings')
  const colors = BOOKING_STATUS_COLORS[booking.status]

  const schedule = booking.classSchedule
  const classInfo = schedule?.class

  if (!schedule) return null

  const startTime = parseISO(schedule.startTimeUtc)
  const endTime = parseISO(schedule.endTimeUtc)
  const isUpcoming = isFuture(startTime)

  return (
    <Card className={cn('border-border/50 transition-all', !isUpcoming && 'opacity-75')}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Class Info */}
          <div className="flex gap-4">
            {/* Date Badge */}
            <div className="flex-shrink-0 w-16 text-center">
              <div className="bg-primary/10 rounded-lg p-2">
                <div className="text-xs text-primary font-medium uppercase">{format(startTime, 'MMM')}</div>
                <div className="text-2xl font-bold text-primary">{format(startTime, 'd')}</div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2">
              <div>
                <h3 className="font-semibold text-lg">{classInfo?.title}</h3>
                <p className="text-foreground-muted text-sm">{format(startTime, 'EEEE')}</p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-foreground-muted">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>
                    {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn('text-xs', colors.text, colors.border, colors.bg)}>
                  {booking.status === 'BOOKED' && t('booked')}
                  {booking.status === 'WAITLISTED' && t('waitlisted')}
                  {booking.status === 'CANCELLED' && t('cancelled')}
                  {booking.status === 'ATTENDED' && t('attended')}
                  {booking.status === 'NO_SHOW' && t('noShow')}
                </Badge>

                {booking.status === 'WAITLISTED' && booking.waitlistPosition && (
                  <span className="text-xs text-foreground-muted">
                    {t('position')} #{booking.waitlistPosition}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {showCancel && (booking.status === 'BOOKED' || booking.status === 'WAITLISTED') && (
            <DpButton
              variant="outline"
              size="small"
              onClick={onCancel}
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <X className="w-4 h-4" />
              Cancel
            </DpButton>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function BookingsContent() {
  const t = useTranslations('scheduling.bookings')
  const tCommon = useTranslations('common')
  const { session } = useSession()
  const { addNotification } = useNotifications()

  const [cancelBookingId, setCancelBookingId] = useState<number | null>(null)

  // Fetch my bookings
  const { data: bookingsData, isLoading } = useMyBookings()
  const cancelBookingMutation = useCancelBooking()

  const handleCancelBooking = async () => {
    if (!cancelBookingId) return

    try {
      await cancelBookingMutation.mutateAsync({ id: cancelBookingId })
      addNotification({ message: 'Booking cancelled', type: 'success' })
      setCancelBookingId(null)
    } catch (error: any) {
      addNotification({
        message: error?.message || 'Failed to cancel booking',
        type: 'error',
      })
    }
  }

  if (isLoading) {
    return <BookingsSkeleton />
  }

  const upcomingBookings = bookingsData?.upcoming || []
  const pastBookings = bookingsData?.past || []

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1>{t('myBookings')}</h1>
        <p className="text-foreground-muted mt-1">View and manage your class bookings</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming" className="gap-2">
            <Calendar className="w-4 h-4" />
            {t('upcoming')}
            {upcomingBookings.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {upcomingBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2">
            <Clock className="w-4 h-4" />
            {t('past')}
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Bookings */}
        <TabsContent value="upcoming" className="mt-6">
          {upcomingBookings.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="py-16 text-center">
                <CalendarOff className="w-12 h-12 mx-auto mb-4 text-foreground-muted opacity-50" />
                <h3 className="text-lg font-semibold mb-2">{t('empty')}</h3>
                <p className="text-foreground-muted">{t('emptyDescription')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking: Booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={() => setCancelBookingId(booking.id)}
                  showCancel
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Past Bookings */}
        <TabsContent value="past" className="mt-6">
          {pastBookings.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="py-16 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-foreground-muted opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No past bookings</h3>
                <p className="text-foreground-muted">Your booking history will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastBookings.map((booking: Booking) => (
                <BookingCard key={booking.id} booking={booking} showCancel={false} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Confirmation */}
      <AlertDialog open={!!cancelBookingId} onOpenChange={() => setCancelBookingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('cancelBooking')}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? If there&apos;s a waitlist, your spot will be given to the
              next person.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelBooking} className="bg-red-600 hover:bg-red-700">
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
