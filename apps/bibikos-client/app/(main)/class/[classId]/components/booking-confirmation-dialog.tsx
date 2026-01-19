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
import { format, parseISO } from 'date-fns'
import { useTranslations } from 'next-intl'
import type { ClassViewSchedule, ClassViewResponse } from '../../../../../lib/scheduling'

interface BookingConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: ClassViewSchedule | null
  classData: ClassViewResponse | null
  onConfirm: () => void
  isPending: boolean
}

export function BookingConfirmationDialog({
  open,
  onOpenChange,
  schedule,
  classData,
  onConfirm,
  isPending,
}: BookingConfirmationDialogProps) {
  const tCommon = useTranslations('common')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Booking</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              {schedule && classData && (
                <div className="space-y-2 mt-4">
                  <p className="font-medium text-foreground">{classData.title}</p>
                  <p className="text-sm">{format(parseISO(schedule.startTimeUtc), 'EEEE, MMMM d, yyyy')}</p>
                  <p className="text-sm">
                    {format(parseISO(schedule.startTimeUtc), 'h:mm a')} -{' '}
                    {format(parseISO(schedule.endTimeUtc), 'h:mm a')}
                  </p>
                  <p className="text-sm text-foreground-muted mt-2">{classData.location.name}</p>
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
