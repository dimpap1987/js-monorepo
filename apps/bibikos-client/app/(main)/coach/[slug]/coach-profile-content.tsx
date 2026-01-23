'use client'

import { useBibikosSession } from '../../../../lib/auth'
import { Button } from '@js-monorepo/components/ui/button'
import { useNotifications } from '@js-monorepo/notification'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { format, addWeeks, startOfDay, endOfWeek } from 'date-fns'
import {
  useOrganizerPublicProfile,
  useOrganizerPublicSchedules,
  useCreateBooking,
  ClassSchedule,
} from '../../../../lib/scheduling'
import { CoachProfileSkeleton, CoachProfileHero, CoachSchedulesList, BookingConfirmationDialog } from './components'
import { ContainerTemplate } from '@js-monorepo/templates'

function CoachNotFound({ onGoHome }: { onGoHome: () => void }) {
  return (
    <ContainerTemplate>
      <AlertCircle className="w-16 h-16 mx-auto mb-4 text-foreground-muted opacity-50" />
      <h1 className="text-2xl font-bold mb-2">Coach not found</h1>
      <p className="text-foreground-muted mb-6">
        The coach profile you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Button onClick={onGoHome}>Go Home</Button>
    </ContainerTemplate>
  )
}

interface CoachProfileContentProps {
  slug: string
}

export function CoachProfileContent({ slug }: CoachProfileContentProps) {
  const { isLoggedIn } = useBibikosSession()
  const router = useRouter()
  const { addNotification } = useNotifications()

  const [selectedSchedule, setSelectedSchedule] = useState<ClassSchedule | null>(null)
  const [confirmBooking, setConfirmBooking] = useState(false)

  const { data: profile, isLoading: isProfileLoading, error: profileError } = useOrganizerPublicProfile(slug)

  const today = new Date()
  const startDate = format(startOfDay(today), 'yyyy-MM-dd')
  const endDate = format(endOfWeek(addWeeks(today, 4), { weekStartsOn: 1 }), 'yyyy-MM-dd')

  const { data: schedules, isLoading: isSchedulesLoading } = useOrganizerPublicSchedules(slug, startDate, endDate)

  const createBookingMutation = useCreateBooking()

  const handleBookSchedule = (schedule: ClassSchedule) => {
    setSelectedSchedule(schedule)
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
      router.push('/dashboard/bookings')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to book class'
      addNotification({
        message: errorMessage,
        type: 'error',
      })
    }
  }

  if (isProfileLoading) {
    return <CoachProfileSkeleton />
  }

  if (profileError || !profile) {
    return <CoachNotFound onGoHome={() => router.push('/')} />
  }

  return (
    <ContainerTemplate className="space-y-5">
      <CoachProfileHero profile={profile} />

      <ContainerTemplate>
        <CoachSchedulesList schedules={schedules} isLoading={isSchedulesLoading} onBookSchedule={handleBookSchedule} />
      </ContainerTemplate>

      <BookingConfirmationDialog
        open={confirmBooking}
        onOpenChange={setConfirmBooking}
        schedule={selectedSchedule}
        onConfirm={handleConfirmBooking}
        isPending={createBookingMutation.isPending}
      />
    </ContainerTemplate>
  )
}
