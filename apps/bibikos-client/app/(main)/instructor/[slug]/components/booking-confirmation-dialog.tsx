'use client'

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
import { Button } from '@js-monorepo/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@js-monorepo/components/ui/drawer'
import { Calendar, Clock, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useScheduleTime } from '../../../../../lib/datetime'

// Generic schedule type for booking confirmation - works with ClassSchedule and OrganizerPublicSchedule
interface BookableSchedule {
  id: number
  startTimeUtc: string
  endTimeUtc: string
  localTimezone: string
  class?: {
    title: string
    capacity?: number | null
  }
}

interface BookingConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: BookableSchedule | null
  onConfirm: () => void
  isPending: boolean
}

function ScheduleDetails({ schedule }: { schedule: BookableSchedule }) {
  const { fullDate, timeRange } = useScheduleTime(schedule)

  return (
    <div className="space-y-3">
      <div className="text-base font-medium text-foreground">{schedule.class?.title}</div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <span>{fullDate}</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>{timeRange}</span>
      </div>
    </div>
  )
}

export function BookingConfirmationDialog({
  open,
  onOpenChange,
  schedule,
  onConfirm,
  isPending,
}: BookingConfirmationProps) {
  const tCommon = useTranslations('common')
  const tBookings = useTranslations('scheduling.bookings')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{tBookings('confirmBooking')}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="mt-4">{schedule && <ScheduleDetails schedule={schedule} />}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isPending ? tBookings('booking') : tCommon('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function BookingConfirmationDrawer({
  open,
  onOpenChange,
  schedule,
  onConfirm,
  isPending,
}: BookingConfirmationProps) {
  const tCommon = useTranslations('common')
  const tBookings = useTranslations('scheduling.bookings')

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-5">
        <DrawerHeader>
          <DrawerTitle>{tBookings('confirmBooking')}</DrawerTitle>
          <DrawerDescription>{tBookings('confirmBookingDescription')}</DrawerDescription>
        </DrawerHeader>
        <div className="p-4">{schedule && <ScheduleDetails schedule={schedule} />}</div>
        <DrawerFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isPending ? tBookings('booking') : tCommon('confirm')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
