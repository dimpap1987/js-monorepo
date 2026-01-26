'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { Button } from '@js-monorepo/components/ui/button'
import { useNotifications } from '@js-monorepo/notification'
import { ContainerTemplate } from '@js-monorepo/templates'
import { addWeeks, endOfWeek, format, startOfDay } from 'date-fns'
import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next-nprogress-bar'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import {
  OrganizerPublicSchedule,
  useCancelBooking,
  useCreateBooking,
  useOrganizerPublicProfile,
  useOrganizerPublicSchedules,
} from '../../../../lib/scheduling'
import { useDeviceStore } from '../../../../stores/deviceStore'
import { CancelBookingDialog, CancelBookingDrawer } from '../../discover/components'
import {
  BookingConfirmationDialog,
  BookingConfirmationDrawer,
  CoachProfileHero,
  CoachProfileSkeleton,
  CoachSchedulesList,
} from './components'

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
  const { isLoggedIn } = useSession()
  const router = useRouter()
  const { addNotification } = useNotifications()
  const isMobile = useDeviceStore((state) => state.isMobile)
  const tBookings = useTranslations('scheduling.bookings')

  const [selectedSchedule, setSelectedSchedule] = useState<OrganizerPublicSchedule | null>(null)
  const [confirmBooking, setConfirmBooking] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [scheduleToCancel, setScheduleToCancel] = useState<OrganizerPublicSchedule | null>(null)

  const { data: profile, isLoading: isProfileLoading, error: profileError } = useOrganizerPublicProfile(slug)

  const today = new Date()
  const startDate = format(startOfDay(today), 'yyyy-MM-dd')
  const endDate = format(endOfWeek(addWeeks(today, 4), { weekStartsOn: 1 }), 'yyyy-MM-dd')

  const {
    data: schedules,
    isLoading: isSchedulesLoading,
    refetch,
  } = useOrganizerPublicSchedules(slug, startDate, endDate)

  const createBookingMutation = useCreateBooking()
  const cancelBookingMutation = useCancelBooking()

  const handleBookSchedule = (schedule: OrganizerPublicSchedule) => {
    setSelectedSchedule(schedule)
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=/coach/${slug}`)
      return
    }
    setConfirmBooking(true)
  }

  const handleCancelRequest = (schedule: OrganizerPublicSchedule) => {
    setScheduleToCancel(schedule)
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!scheduleToCancel?.myBooking) return

    try {
      await cancelBookingMutation.mutateAsync({ id: scheduleToCancel.myBooking.id })
      addNotification({
        message: tBookings('cancelSuccess'),
        type: 'success',
      })
      setCancelDialogOpen(false)
      setScheduleToCancel(null)
      refetch()
    } catch (error: unknown) {
      addNotification({
        message: error instanceof Error ? error.message : tBookings('cancelError'),
        type: 'error',
      })
    }
  }

  const handleConfirmBooking = async () => {
    if (!selectedSchedule) return

    try {
      const booking = await createBookingMutation.mutateAsync({
        classScheduleId: selectedSchedule.id,
      })

      if (booking.status === 'WAITLISTED') {
        addNotification({
          message: tBookings('waitlistSuccess', { position: booking.waitlistPosition }),
          type: 'information',
        })
      } else {
        addNotification({
          message: tBookings('bookingSuccess'),
          type: 'success',
        })
      }

      setConfirmBooking(false)
      setSelectedSchedule(null)
      refetch()
    } catch (error: unknown) {
      addNotification({
        message: error instanceof Error ? error.message : tBookings('bookingError'),
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
        <CoachSchedulesList
          schedules={schedules}
          isLoading={isSchedulesLoading}
          onBookSchedule={handleBookSchedule}
          onCancelSchedule={handleCancelRequest}
        />
      </ContainerTemplate>

      {selectedSchedule &&
        (isMobile ? (
          <BookingConfirmationDrawer
            open={confirmBooking}
            onOpenChange={setConfirmBooking}
            schedule={selectedSchedule}
            onConfirm={handleConfirmBooking}
            isPending={createBookingMutation.isPending}
          />
        ) : (
          <BookingConfirmationDialog
            open={confirmBooking}
            onOpenChange={setConfirmBooking}
            schedule={selectedSchedule}
            onConfirm={handleConfirmBooking}
            isPending={createBookingMutation.isPending}
          />
        ))}

      {scheduleToCancel &&
        (isMobile ? (
          <CancelBookingDrawer
            schedule={scheduleToCancel}
            open={cancelDialogOpen}
            onOpenChange={setCancelDialogOpen}
            onConfirm={handleCancelConfirm}
            isLoading={cancelBookingMutation.isPending}
          />
        ) : (
          <CancelBookingDialog
            schedule={scheduleToCancel}
            open={cancelDialogOpen}
            onOpenChange={setCancelDialogOpen}
            onConfirm={handleCancelConfirm}
            isLoading={cancelBookingMutation.isPending}
          />
        ))}
    </ContainerTemplate>
  )
}
