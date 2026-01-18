'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@js-monorepo/components/ui/button'
import { Badge } from '@js-monorepo/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@js-monorepo/components/ui/dialog'
import { Form } from '@js-monorepo/components/ui/form'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { format, differenceInDays, differenceInWeeks, getDay, parseISO } from 'date-fns'
import { CalendarRange, CalendarDays } from 'lucide-react'
import { Class, Location } from '../../../../lib/scheduling'
import { scheduleSchema, type ScheduleFormData } from '../schemas'
import { ScheduleFormFields } from './schedule-form-fields'
import { DateSelection } from './calendar-view'

interface ScheduleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classes: Class[]
  locations: Location[]
  onSubmit: (data: ScheduleFormData) => Promise<void>
  isSubmitting: boolean
  initialClassId?: number
  initialDateRange?: DateSelection | null
}

// Map day number (0=Sunday) to RRULE day code
const DAY_MAP: Record<number, string> = {
  0: 'SU',
  1: 'MO',
  2: 'TU',
  3: 'WE',
  4: 'TH',
  5: 'FR',
  6: 'SA',
}

export function ScheduleForm({
  open,
  onOpenChange,
  classes,
  locations,
  onSubmit,
  isSubmitting,
  initialClassId,
  initialDateRange,
}: ScheduleFormProps) {
  const tSchedules = useTranslations('scheduling.schedules')
  const tCommon = useTranslations('common')
  const hasSetInitialValues = useRef(false)

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      classId: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      duration: 60,
      recurrence: 'none',
      recurrenceDays: [],
      recurrenceCount: 10,
    },
  })

  const recurrence = useWatch({
    control: form.control,
    name: 'recurrence',
  })

  // Calculate smart recurrence suggestion based on date range
  const rangeInfo = useMemo(() => {
    if (!initialDateRange?.isRange) return null

    const start = parseISO(initialDateRange.startDate)
    const end = parseISO(initialDateRange.endDate)
    const daysDiff = differenceInDays(end, start) + 1 // Include both days
    const weeksDiff = differenceInWeeks(end, start)

    // Get day of week for start date
    const startDayOfWeek = getDay(start)
    const dayCode = DAY_MAP[startDayOfWeek]

    // Determine suggested recurrence
    let suggestedRecurrence: 'daily' | 'weekly' | 'biweekly' = 'weekly'
    let suggestedCount = daysDiff

    if (daysDiff <= 7) {
      // Less than a week: suggest daily
      suggestedRecurrence = 'daily'
      suggestedCount = daysDiff
    } else if (weeksDiff >= 2 && weeksDiff % 2 === 0) {
      // Even number of weeks >= 2: suggest biweekly
      suggestedRecurrence = 'biweekly'
      suggestedCount = Math.ceil(weeksDiff / 2) + 1
    } else {
      // Default to weekly
      suggestedRecurrence = 'weekly'
      suggestedCount = weeksDiff + 1
    }

    return {
      daysDiff,
      weeksDiff,
      startDayOfWeek,
      dayCode,
      suggestedRecurrence,
      suggestedCount,
      startDateFormatted: format(start, 'MMM d'),
      endDateFormatted: format(end, 'MMM d, yyyy'),
    }
  }, [initialDateRange])

  // Update recurrence values when user changes pattern (for range selection)
  useEffect(() => {
    if (!rangeInfo) return

    if (recurrence === 'daily') {
      form.setValue('recurrenceCount', rangeInfo.daysDiff)
      form.setValue('recurrenceDays', [])
    } else if (recurrence === 'weekly') {
      const weeksCount = Math.ceil(rangeInfo.daysDiff / 7) + 1
      form.setValue('recurrenceCount', weeksCount)
      form.setValue('recurrenceDays', [rangeInfo.dayCode])
    }
  }, [recurrence, rangeInfo, form])

  // Set initial values when dialog opens
  useEffect(() => {
    if (open && !hasSetInitialValues.current) {
      if (initialDateRange) {
        form.setValue('date', initialDateRange.startDate)
        if (initialDateRange.startTime && initialDateRange.startTime !== '00:00') {
          form.setValue('startTime', initialDateRange.startTime)
        }

        // If it's a range, set smart recurrence
        if (initialDateRange.isRange && rangeInfo) {
          form.setValue('recurrence', rangeInfo.suggestedRecurrence)
          form.setValue('recurrenceDays', [rangeInfo.dayCode])
          form.setValue('recurrenceCount', rangeInfo.suggestedCount)
        }
      }

      if (initialClassId) {
        const timer = setTimeout(() => {
          form.setValue('classId', initialClassId)
        }, 0)
        return () => clearTimeout(timer)
      }
      hasSetInitialValues.current = true
    } else if (!open) {
      hasSetInitialValues.current = false
      form.reset()
    }
  }, [open, initialDateRange, initialClassId, form, rangeInfo])

  const handleSubmit = async (data: ScheduleFormData) => {
    await onSubmit(data)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {rangeInfo ? (
              <CalendarRange className="w-5 h-5 text-primary" />
            ) : (
              <CalendarDays className="w-5 h-5 text-primary" />
            )}
            {tSchedules('add')}
          </DialogTitle>
          <DialogDescription>
            {rangeInfo ? 'Create recurring schedules for the selected date range' : 'Schedule a new class session'}
          </DialogDescription>
        </DialogHeader>

        {/* Date Range Banner */}
        {rangeInfo && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <CalendarRange className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">
                {rangeInfo.startDateFormatted} → {rangeInfo.endDateFormatted}
              </div>
              <div className="text-xs text-foreground-muted">{rangeInfo.daysDiff} days selected</div>
            </div>
            <Badge variant="secondary" className="flex-shrink-0">
              {rangeInfo.suggestedRecurrence === 'daily' && 'Daily'}
              {rangeInfo.suggestedRecurrence === 'weekly' && 'Weekly'}
              {rangeInfo.suggestedRecurrence === 'biweekly' && 'Bi-weekly'}
            </Badge>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <ScheduleFormFields
              control={form.control}
              classes={classes}
              locations={locations}
              recurrence={recurrence}
              isRangeSelection={!!rangeInfo}
              rangeInfo={rangeInfo}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" loading={isSubmitting} disabled={!form.formState.isValid}>
                {rangeInfo
                  ? recurrence === 'daily'
                    ? `Create ${rangeInfo.daysDiff} Sessions`
                    : `Create ${Math.ceil(rangeInfo.daysDiff / 7) + 1} Sessions`
                  : recurrence === 'weekly'
                    ? `Create ${form.watch('recurrenceCount')} Sessions`
                    : tCommon('create')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
