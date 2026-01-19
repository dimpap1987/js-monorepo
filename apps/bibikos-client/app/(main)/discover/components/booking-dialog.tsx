'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { Button } from '@js-monorepo/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@js-monorepo/components/ui/dialog'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { format, parseISO } from 'date-fns'
import { AlertCircle, Calendar, CheckCircle2, Clock, Loader2, User } from 'lucide-react'
import { useState } from 'react'
import type { DiscoverSchedule } from '../../../../lib/scheduling'
import { useCreateBooking } from '../../../../lib/scheduling'

interface BookingDialogProps {
  schedule: DiscoverSchedule | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function LoginPrompt({ schedule }: { schedule: DiscoverSchedule }) {
  const startTime = parseISO(schedule.startTimeUtc)

  return (
    <>
      <DialogHeader>
        <DialogTitle>Sign in to book</DialogTitle>
        <DialogDescription>You need to sign in to book this class.</DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{format(startTime, 'EEEE, MMMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>
            {format(startTime, 'h:mm a')} - {format(parseISO(schedule.endTimeUtc), 'h:mm a')}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium">{schedule.class?.title}</span>
        </div>
        {schedule.organizer?.displayName && (
          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>{schedule.organizer.displayName}</span>
          </div>
        )}
      </div>
      <DialogFooter>
        <DpNextNavLink href="/auth/login">
          <Button className="w-full">Sign in to continue</Button>
        </DpNextNavLink>
      </DialogFooter>
    </>
  )
}

type BookingState = 'idle' | 'loading' | 'success' | 'error'

interface BookingFormProps {
  schedule: DiscoverSchedule
  onClose: () => void
}

function BookingForm({ schedule, onClose }: BookingFormProps) {
  const [bookingState, setBookingState] = useState<BookingState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const createBooking = useCreateBooking()

  const startTime = parseISO(schedule.startTimeUtc)
  const endTime = parseISO(schedule.endTimeUtc)
  const classInfo = schedule.class
  const bookingCounts = schedule.bookingCounts

  const bookedCount = bookingCounts?.booked || 0
  const capacity = classInfo?.capacity ?? null
  const isFull = capacity !== null ? bookedCount >= capacity : false
  const hasWaitlist = Boolean(classInfo?.waitlistLimit && classInfo.waitlistLimit > 0)

  const handleBook = async () => {
    setBookingState('loading')
    setErrorMessage('')

    try {
      await createBooking.mutateAsync({ classScheduleId: schedule.id })
      setBookingState('success')
    } catch (error: unknown) {
      setBookingState('error')
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Failed to create booking. Please try again.')
      }
    }
  }

  if (bookingState === 'success') {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Booking confirmed!
          </DialogTitle>
          <DialogDescription>You&apos;re all set for your class.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{format(startTime, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>
              {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
            </span>
          </div>
          <div className="text-sm font-medium">{classInfo?.title}</div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isFull && hasWaitlist ? 'Join Waitlist' : 'Confirm Booking'}</DialogTitle>
        <DialogDescription>
          {isFull && hasWaitlist
            ? "This class is full, but you can join the waitlist and we'll notify you if a spot opens up."
            : 'Review the details below and confirm your booking.'}
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{format(startTime, 'EEEE, MMMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>
            {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
          </span>
        </div>
        <div className="text-sm font-medium">{classInfo?.title}</div>
        {schedule.organizer?.displayName && (
          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>{schedule.organizer.displayName}</span>
          </div>
        )}

        {bookingState === 'error' && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose} disabled={bookingState === 'loading'}>
          Cancel
        </Button>
        <Button onClick={handleBook} disabled={bookingState === 'loading'}>
          {bookingState === 'loading' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isFull && hasWaitlist ? 'Join Waitlist' : 'Confirm Booking'}
        </Button>
      </DialogFooter>
    </>
  )
}

export function BookingDialog({ schedule, open, onOpenChange }: BookingDialogProps) {
  const { isLoggedIn } = useSession()

  if (!schedule) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {isLoggedIn ? (
          <BookingForm schedule={schedule} onClose={() => onOpenChange(false)} />
        ) : (
          <LoginPrompt schedule={schedule} />
        )}
      </DialogContent>
    </Dialog>
  )
}
