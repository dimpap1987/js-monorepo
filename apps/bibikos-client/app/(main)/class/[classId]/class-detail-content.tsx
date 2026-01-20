'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { useNotifications } from '@js-monorepo/notification'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ClassViewSchedule, useClassView, useCreateBooking } from '../../../../lib/scheduling'
import {
  BookingConfirmationDialog,
  ClassAccessDenied,
  ClassDetailHero,
  ClassDetailSkeleton,
  ClassNotFound,
  ClassSchedulesList,
} from './components'

interface ClassDetailContentProps {
  classId: number
}

export function ClassDetailContent({ classId }: ClassDetailContentProps) {
  const { isLoggedIn } = useSession()
  const router = useRouter()
  const { addNotification } = useNotifications()

  const [selectedSchedule, setSelectedSchedule] = useState<ClassViewSchedule | null>(null)
  const [confirmBooking, setConfirmBooking] = useState(false)

  const { data: classData, isLoading, error } = useClassView(classId)
  const createBookingMutation = useCreateBooking()

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
    <div className="min-h-screen bg-gradient-to-b from-background to-background-secondary/30">
      <ClassDetailHero classData={classData} />

      <div className="container mx-auto px-4 py-8">
        <ClassSchedulesList classData={classData} onBookSchedule={handleBookSchedule} />
      </div>

      <BookingConfirmationDialog
        open={confirmBooking}
        onOpenChange={setConfirmBooking}
        schedule={selectedSchedule}
        classData={classData}
        onConfirm={handleConfirmBooking}
        isPending={createBookingMutation.isPending}
      />
    </div>
  )
}
