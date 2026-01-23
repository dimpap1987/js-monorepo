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
import { useTranslations } from 'next-intl'
import type { ClassSchedule } from '../../../../../lib/scheduling'
import { useScheduleTime } from '../../../../../lib/datetime'

interface BookingConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: ClassSchedule | null
  onConfirm: () => void
  isPending: boolean
}

export function BookingConfirmationDialog({
  open,
  onOpenChange,
  schedule,
  onConfirm,
  isPending,
}: BookingConfirmationDialogProps) {
  const tCommon = useTranslations('common')
  const { fullDate, timeRange } = useScheduleTime(schedule)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Booking</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              {schedule && (
                <div className="space-y-2 mt-4">
                  <p className="font-medium text-foreground">{schedule.class?.title}</p>
                  <p className="text-sm">{fullDate}</p>
                  <p className="text-sm">{timeRange}</p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {isPending ? 'Booking...' : 'Confirm Booking'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
