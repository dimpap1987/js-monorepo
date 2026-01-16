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

interface CancelScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function CancelScheduleDialog({ open, onOpenChange, onConfirm }: CancelScheduleDialogProps) {
  const tCommon = useTranslations('common')
  const tSchedules = useTranslations('scheduling.schedules')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{tSchedules('cancel')}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this schedule? Participants will be notified.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Cancel Schedule
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
