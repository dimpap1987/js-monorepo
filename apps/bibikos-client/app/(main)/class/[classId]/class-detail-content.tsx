'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { useNotifications } from '@js-monorepo/notification'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ClassViewSchedule, useCancelBooking, useClassView, useCreateBooking } from '../../../../lib/scheduling'
import {
  BookingConfirmationDialog,
  CancelBookingDialog,
  ClassAccessDenied,
  ClassDetailHero,
  ClassDetailSkeleton,
  ClassNotFound,
  ClassSchedulesList,
} from './components'
import { ContainerTemplate } from '@js-monorepo/templates'

interface ClassDetailContentProps {
  classId: number
}

export function ClassDetailContent({ classId }: ClassDetailContentProps) {
  const { isLoggedIn } = useSession()
  const router = useRouter()
  const { addNotification } = useNotifications()

  const [selectedSchedule, setSelectedSchedule] = useState<ClassViewSchedule | null>(null)
  const [confirmBooking, setConfirmBooking] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const { data: classData, isLoading, error } = useClassView(classId)
  const createBookingMutation = useCreateBooking()
  const cancelBookingMutation = useCancelBooking()

  const handleBookSchedule = (schedule: ClassViewSchedule) => {
    setSelectedSchedule(schedule)
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=/class/${classId}`)
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
    } catch (er: unknown) {
      const errorMessage = er instanceof Error ? er.message : 'Failed to book class'
      addNotification({
        message: errorMessage,
        type: 'error',
      })
    }
  }

  const handleCancelSchedule = (schedule: ClassViewSchedule) => {
    setSelectedSchedule(schedule)
    setConfirmCancel(true)
  }

  const handleConfirmCancel = async () => {
    if (!selectedSchedule?.myBooking) return

    try {
      await cancelBookingMutation.mutateAsync({ id: selectedSchedule.myBooking.id })
      addNotification({
        message: 'Booking cancelled successfully',
        type: 'success',
      })
      setConfirmCancel(false)
      setSelectedSchedule(null)
    } catch (er: unknown) {
      const errorMessage = er instanceof Error ? er.message : 'Failed to cancel booking'
      addNotification({
        message: errorMessage,
        type: 'error',
      })
    }
  }

  if (isLoading) {
    return <ClassDetailSkeleton />
  }

  // Handle 403 (access denied) for private classes
  if (error) {
    const errorMessage = error instanceof Error ? error.message : ''
    if (errorMessage.includes('CLASS_ACCESS_DENIED') || errorMessage.includes('403')) {
      return <ClassAccessDenied isLoggedIn={isLoggedIn} />
    }
    // Other errors - show not found
    return <ClassNotFound />
  }

  if (!classData) {
    return <ClassNotFound />
  }

  return (
    <ContainerTemplate className="space-y-5">
      <ClassDetailHero classData={classData} />

      <ContainerTemplate>
        <ClassSchedulesList
          classData={classData}
          onBookSchedule={handleBookSchedule}
          onCancelSchedule={handleCancelSchedule}
        />
      </ContainerTemplate>

      <BookingConfirmationDialog
        open={confirmBooking}
        onOpenChange={setConfirmBooking}
        schedule={selectedSchedule}
        classData={classData}
        onConfirm={handleConfirmBooking}
        isPending={createBookingMutation.isPending}
      />

      <CancelBookingDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        onConfirm={handleConfirmCancel}
        isPending={cancelBookingMutation.isPending}
      />
    </ContainerTemplate>
  )
}
