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
import { RadioGroup, RadioGroupItem } from '@js-monorepo/components/ui/radio-group'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { ClassSchedule } from '../../../../lib/scheduling'

export type CancelMode = 'single' | 'series'

interface CancelScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (mode: CancelMode) => void
  schedule: ClassSchedule | null
}

export function CancelScheduleDialog({ open, onOpenChange, onConfirm, schedule }: CancelScheduleDialogProps) {
  const tCommon = useTranslations('common')
  const tSchedules = useTranslations('scheduling.schedules')
  const [cancelMode, setCancelMode] = useState<CancelMode>('single')

  // Check if schedule is part of a recurring series
  const isRecurring = schedule?.parentScheduleId !== null || schedule?.recurrenceRule !== null

  // Reset to single when dialog opens
  useEffect(() => {
    if (open) {
      setCancelMode('single')
    }
  }, [open])

  const handleConfirm = () => {
    onConfirm(cancelMode)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{tSchedules('cancel')}</AlertDialogTitle>
          <AlertDialogDescription>
            {isRecurring
              ? 'This schedule is part of a recurring series. Choose how you want to cancel.'
              : 'Are you sure you want to cancel this schedule? Participants will be notified.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isRecurring && (
          <RadioGroup value={cancelMode} onValueChange={(value) => setCancelMode(value as CancelMode)} className="my-4">
            <label
              htmlFor="cancel-single"
              className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-background-secondary/50 cursor-pointer"
            >
              <RadioGroupItem value="single" id="cancel-single" />
              <div className="flex-1">
                <div className="font-medium">Cancel this schedule only</div>
                <div className="text-sm text-foreground-muted">Only this occurrence will be cancelled</div>
              </div>
            </label>
            <label
              htmlFor="cancel-series"
              className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-background-secondary/50 cursor-pointer"
            >
              <RadioGroupItem value="series" id="cancel-series" />
              <div className="flex-1">
                <div className="font-medium">Cancel this and all future schedules</div>
                <div className="text-sm text-foreground-muted">
                  All schedules from this date onwards will be cancelled
                </div>
              </div>
            </label>
          </RadioGroup>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">
            {cancelMode === 'series' && isRecurring ? 'Cancel All Future' : 'Cancel Schedule'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
