'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { Button } from '@js-monorepo/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@js-monorepo/components/ui/card'
import { Badge } from '@js-monorepo/components/ui/badge'
import { Skeleton } from '@js-monorepo/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@js-monorepo/components/ui/dialog'
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
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  User,
  Calendar,
  Clock,
  MapPin,
  Video,
  Building,
  Users,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { format, parseISO, addWeeks, startOfWeek, endOfWeek } from 'date-fns'
import {
  useOrganizerPublicProfile,
  useSchedulesCalendar,
  useCreateBooking,
  ClassSchedule,
  BOOKING_STATUS_COLORS,
} from '../../../../lib/scheduling'

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-secondary/30">
      <div className="relative bg-primary/5 border-b border-border/50">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-full" />
            <div className="text-center sm:text-left space-y-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full max-w-2xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
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
                  <Skeleton className="h-10 w-28" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

interface CoachProfileContentProps {
  slug: string
}

export function CoachProfileContent({ slug }: CoachProfileContentProps) {
  const t = useTranslations('scheduling')
  const tCommon = useTranslations('common')
  const { session, isLoggedIn } = useSession()
  const router = useRouter()
  const { addNotification } = useNotifications()

  const [selectedSchedule, setSelectedSchedule] = useState<ClassSchedule | null>(null)
  const [confirmBooking, setConfirmBooking] = useState(false)

  // Fetch public profile
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useOrganizerPublicProfile(slug)

  // Fetch upcoming schedules for this organizer (next 4 weeks)
  const today = new Date()
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const fourWeeksEnd = format(endOfWeek(addWeeks(today, 4), { weekStartsOn: 1 }), 'yyyy-MM-dd')

  // Note: We'll need to add a public endpoint for this - for now just show profile
  // const { data: schedules, isLoading: isSchedulesLoading } = useSchedulesCalendar(weekStart, fourWeeksEnd)

  const createBookingMutation = useCreateBooking()

  const handleBookClass = () => {
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=/coach/${slug}`)
      return
    }
    setConfirmBooking(true)
  }

  const handleConfirmBooking = async () => {
    if (!selectedSchedule) return

    try {
      const booking = await createBookingMutation.mutateAsync({
        classScheduleId: selectedSchedule.id,
      })

      if (booking.status === 'WAITLISTED') {
        addNotification({
          message: `Added to waitlist (position #${booking.waitlistPosition})`,
          type: 'information',
        })
      } else {
        addNotification({
          message: 'Booking confirmed!',
          type: 'success',
        })
      }

      setConfirmBooking(false)
      setSelectedSchedule(null)
      router.push('/bookings')
    } catch (error: any) {
      addNotification({
        message: error?.message || 'Failed to book class',
        type: 'error',
      })
    }
  }

  if (isProfileLoading) {
    return <ProfileSkeleton />
  }

  if (profileError || !profile) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-foreground-muted opacity-50" />
        <h1 className="text-2xl font-bold mb-2">Coach not found</h1>
        <p className="text-foreground-muted mb-6">
          The coach profile you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-secondary/30">
      {/* Hero Section */}
      <div className="relative bg-primary/5 border-b border-border/50">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-background">
              <User className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
            </div>

            {/* Info */}
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{profile.displayName || 'Coach'}</h1>

              {profile.activityLabel && (
                <Badge variant="secondary" className="mb-4">
                  {profile.activityLabel}
                </Badge>
              )}

              {profile.bio && <p className="text-foreground-muted max-w-2xl leading-relaxed">{profile.bio}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Upcoming Classes Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Upcoming Classes</h2>
          </div>

          {/* Placeholder for schedules - would need public endpoint */}
          <Card className="border-border/50">
            <CardContent className="py-16 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-foreground-muted opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Class Schedule Coming Soon</h3>
              <p className="text-foreground-muted max-w-md mx-auto">
                This coach&apos;s class schedule will be available here. Check back soon or contact them directly to
                book a class.
              </p>
            </CardContent>
          </Card>

          {/* Example of how schedule cards would look */}
          {/*
          <div className="grid gap-4">
            {schedules?.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onBook={() => {
                  setSelectedSchedule(schedule)
                  handleBookClass()
                }}
              />
            ))}
          </div>
          */}
        </div>
      </div>

      {/* Booking Confirmation Dialog */}
      <AlertDialog open={confirmBooking} onOpenChange={setConfirmBooking}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Booking</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedSchedule && (
                <div className="space-y-2 mt-4">
                  <p className="font-medium text-foreground">{selectedSchedule.class?.title}</p>
                  <p className="text-sm">{format(parseISO(selectedSchedule.startTimeUtc), 'EEEE, MMMM d, yyyy')}</p>
                  <p className="text-sm">
                    {format(parseISO(selectedSchedule.startTimeUtc), 'h:mm a')} -{' '}
                    {format(parseISO(selectedSchedule.endTimeUtc), 'h:mm a')}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBooking} disabled={createBookingMutation.isPending}>
              {createBookingMutation.isPending ? 'Booking...' : 'Confirm Booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Schedule card component for displaying individual class slots
function ScheduleCard({ schedule, onBook }: { schedule: ClassSchedule; onBook: () => void }) {
  const startTime = parseISO(schedule.startTimeUtc)
  const endTime = parseISO(schedule.endTimeUtc)
  const classInfo = schedule.class
  const bookingCounts = schedule.bookingCounts

  const isFull = classInfo?.capacity && bookingCounts ? bookingCounts.booked >= classInfo.capacity : false

  const hasWaitlist = classInfo?.waitlistLimit && classInfo.waitlistLimit > 0

  return (
    <Card className="border-border/50 hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Date & Time */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-16 text-center">
              <div className="bg-primary/10 rounded-lg p-2">
                <div className="text-xs text-primary font-medium uppercase">{format(startTime, 'MMM')}</div>
                <div className="text-2xl font-bold text-primary">{format(startTime, 'd')}</div>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-lg">{classInfo?.title}</h3>
              <div className="flex items-center gap-1.5 text-sm text-foreground-muted">
                <Clock className="w-4 h-4" />
                <span>
                  {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm text-foreground-muted">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>
                    {bookingCounts?.booked || 0}
                    {classInfo?.capacity && ` / ${classInfo.capacity}`}
                  </span>
                </div>

                {isFull ? (
                  <Badge variant="secondary" className="text-xs">
                    {hasWaitlist ? 'Waitlist available' : 'Full'}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs text-green-600">
                    {classInfo?.capacity
                      ? `${classInfo.capacity - (bookingCounts?.booked || 0)} spots left`
                      : 'Available'}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Book Button */}
          <Button onClick={onBook} disabled={isFull && !hasWaitlist} className="gap-2">
            {isFull ? (hasWaitlist ? 'Join Waitlist' : 'Full') : 'Book Now'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
