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
import { Drawer, DrawerContent } from '@js-monorepo/components/ui/drawer'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { format, parseISO } from 'date-fns'
import { AlertCircle, Calendar, CheckCircle2, Clock, Loader2, User } from 'lucide-react'
import { useState } from 'react'
import type { DiscoverSchedule } from '../../../../lib/scheduling'
import { useCreateBooking } from '../../../../lib/scheduling'

interface BookingDialogProps {
  schedule: DiscoverSchedule
  open: boolean
  onOpenChange: (open: boolean) => void
}

function BookingSummary({
  startTime,
  endTime,
  title,
  organizerName,
}: {
  startTime: Date
  endTime: Date
  title?: string
  organizerName?: string | null
}) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4 space-y-3 text-sm">
      <div className="flex items-center gap-3">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span>{format(startTime, 'EEEE, MMMM d, yyyy')}</span>
      </div>

      <div className="flex items-center gap-3">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span>
          {format(startTime, 'h:mm a')} – {format(endTime, 'h:mm a')}
        </span>
      </div>

      {title && <div className="pt-2 border-t text-sm font-medium text-foreground">{title}</div>}

      {organizerName && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span>{organizerName}</span>
        </div>
      )}
    </div>
  )
}

function BookingError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

function BookingSuccess({
  startTime,
  endTime,
  classInfo,
  onClose,
}: {
  startTime: Date
  endTime: Date
  classInfo?: { title?: string }
  onClose: () => void
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-base">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          Booking confirmed
        </DialogTitle>
        <DialogDescription>You’re all set. We’ll see you there.</DialogDescription>
      </DialogHeader>

      <BookingSummary startTime={startTime} endTime={endTime} title={classInfo?.title} />

      <DialogFooter>
        <Button onClick={onClose}>Done</Button>
      </DialogFooter>
    </>
  )
}

function LoginPrompt({ schedule }: { schedule: DiscoverSchedule }) {
  const startTime = parseISO(schedule.startTimeUtc)

  return (
    <>
      <DialogHeader>
        <DialogTitle>Sign in to book</DialogTitle>
        <DialogDescription>You need to sign in to book this class.</DialogDescription>
      </DialogHeader>
      <div className="p-4 space-y-3">
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
    return <BookingSuccess startTime={startTime} endTime={endTime} classInfo={classInfo} onClose={onClose} />
  }

  const isWaitlist = isFull && hasWaitlist

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isWaitlist ? 'Join waitlist' : 'Confirm booking'}</DialogTitle>
        <DialogDescription>
          {isWaitlist
            ? "This class is currently full. Join the waitlist and we'll notify you if a spot opens."
            : 'Review the details below and confirm your booking.'}
        </DialogDescription>
      </DialogHeader>

      <BookingSummary
        startTime={startTime}
        endTime={endTime}
        title={classInfo?.title}
        organizerName={schedule.organizer?.displayName}
      />

      {bookingState === 'error' && <BookingError message={errorMessage} />}

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose} disabled={bookingState === 'loading'}>
          Cancel
        </Button>

        <Button onClick={handleBook} disabled={bookingState === 'loading'}>
          {bookingState === 'loading' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isWaitlist ? 'Join waitlist' : 'Confirm booking'}
        </Button>
      </DialogFooter>
    </>
  )
}

function BookingGate({ schedule, onClose }: { schedule: BookingDialogProps['schedule']; onClose: () => void }) {
  const { isLoggedIn } = useSession()

  if (!isLoggedIn) {
    return <LoginPrompt schedule={schedule} />
  }

  return <BookingForm schedule={schedule} onClose={onClose} />
}

export function BookingDialog({ schedule, open, onOpenChange }: BookingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <BookingGate schedule={schedule} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

export function BookingDrawer({ schedule, open, onOpenChange }: BookingDialogProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-6">
        <BookingGate schedule={schedule} onClose={() => onOpenChange(false)} />
      </DrawerContent>
    </Drawer>
  )
}
