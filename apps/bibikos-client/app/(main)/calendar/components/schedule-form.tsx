'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@js-monorepo/components/ui/button'
import { Badge } from '@js-monorepo/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@js-monorepo/components/ui/dialog'
import { Form } from '@js-monorepo/components/ui/form'
import { useTranslations } from 'next-intl'
import { useMemo, useState, useEffect } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { format, differenceInDays, differenceInWeeks, getDay, parseISO } from 'date-fns'
import { CalendarRange, CalendarDays } from 'lucide-react'
import {
  Class,
  Location,
  DAY_NUMBER_TO_RRULE,
  RECURRENCE_TYPE,
  SCHEDULE_FORM_DEFAULTS,
} from '../../../../lib/scheduling'
import { scheduleSchema, type ScheduleFormData } from '../schemas'
import { ScheduleFormFields } from './schedule-form-fields'
import { DateSelection } from './calendar-view'

interface RangeInfo {
  daysDiff: number
  weeksDiff: number
  startDayOfWeek: number
  dayCode: string
  allDayCodes: string[]
  suggestedRecurrence: 'daily' | 'weekly' | 'biweekly'
  suggestedCount: number
  startDateFormatted: string
  endDateFormatted: string
}

// Helper to calculate submit label
function getSubmitLabel(
  rangeInfo: RangeInfo | null,
  recurrence: string,
  recurrenceCount: number,
  recurrenceDays: string[],
  tSchedules: ReturnType<typeof useTranslations>,
  defaultLabel: string
): string {
  if (rangeInfo) {
    if (recurrence === RECURRENCE_TYPE.DAILY) {
      return tSchedules('createSessions', { count: rangeInfo.daysDiff })
    }
    if (recurrence === RECURRENCE_TYPE.WEEKLY && recurrenceDays.length > 0) {
      const totalSessions = recurrenceCount * recurrenceDays.length
      return tSchedules('createSessions', { count: totalSessions })
    }
  } else if (recurrence === RECURRENCE_TYPE.WEEKLY) {
    return tSchedules('createSessions', { count: recurrenceCount })
  }
  return defaultLabel
}

// Isolated component for form actions - uses subscription to avoid render conflicts
interface FormActionsProps {
  form: UseFormReturn<ScheduleFormData>
  rangeInfo: RangeInfo | null
  isSubmitting: boolean
  onCancel: () => void
}

function FormActions({ form, rangeInfo, isSubmitting, onCancel }: FormActionsProps) {
  const tCommon = useTranslations('common')
  const tSchedules = useTranslations('scheduling.schedules')
  const defaultLabel = tCommon('create')

  const [submitLabel, setSubmitLabel] = useState(() =>
    getSubmitLabel(
      rangeInfo,
      form.getValues('recurrence'),
      form.getValues('recurrenceCount'),
      form.getValues('recurrenceDays'),
      tSchedules,
      defaultLabel
    )
  )

  useEffect(() => {
    const subscription = form.watch((values) => {
      const label = getSubmitLabel(
        rangeInfo,
        values.recurrence || RECURRENCE_TYPE.NONE,
        values.recurrenceCount || 0,
        (values.recurrenceDays || []).filter((d): d is string => d !== undefined),
        tSchedules,
        defaultLabel
      )
      setSubmitLabel(label)
    })
    return () => subscription.unsubscribe()
  }, [form, rangeInfo, defaultLabel, tSchedules])

  return (
    <div className="flex justify-end gap-3 mt-1">
      <Button type="button" variant="outline" onClick={onCancel}>
        {tCommon('cancel')}
      </Button>
      <Button type="submit" loading={isSubmitting} disabled={!form.formState.isValid}>
        {submitLabel}
      </Button>
    </div>
  )
}

interface ScheduleFormContentProps {
  onOpenChange: (open: boolean) => void
  classes: Class[]
  locations: Location[]
  onSubmit: (data: ScheduleFormData) => Promise<void>
  isSubmitting: boolean
  initialClassId?: number
  initialDateRange?: DateSelection | null
}

function ScheduleFormContent({
  onOpenChange,
  classes,
  locations,
  onSubmit,
  isSubmitting,
  initialClassId,
  initialDateRange,
}: ScheduleFormContentProps) {
  const tSchedules = useTranslations('scheduling.schedules')

  const rangeInfo = useMemo((): RangeInfo | null => {
    if (!initialDateRange?.isRange) return null

    const start = parseISO(initialDateRange.startDate)
    const end = parseISO(initialDateRange.endDate)
    const daysDiff = differenceInDays(end, start) + 1
    const weeksDiff = differenceInWeeks(end, start)

    const startDayOfWeek = getDay(start)
    const dayCode = DAY_NUMBER_TO_RRULE[startDayOfWeek]

    const allDayCodes: string[] = []
    const seenDays = new Set<number>()
    for (let i = 0; i < daysDiff && i < SCHEDULE_FORM_DEFAULTS.DAYS_IN_WEEK; i++) {
      const currentDate = new Date(start)
      currentDate.setDate(start.getDate() + i)
      const dayOfWeek = getDay(currentDate)
      if (!seenDays.has(dayOfWeek)) {
        seenDays.add(dayOfWeek)
        allDayCodes.push(DAY_NUMBER_TO_RRULE[dayOfWeek])
      }
    }

    let suggestedRecurrence: 'daily' | 'weekly' | 'biweekly' = RECURRENCE_TYPE.WEEKLY
    let suggestedCount = daysDiff

    if (daysDiff <= SCHEDULE_FORM_DEFAULTS.DAYS_IN_WEEK) {
      suggestedRecurrence = RECURRENCE_TYPE.DAILY
      suggestedCount = daysDiff
    } else if (weeksDiff >= 2 && weeksDiff % 2 === 0) {
      suggestedRecurrence = RECURRENCE_TYPE.BIWEEKLY
      suggestedCount = Math.ceil(weeksDiff / 2) + 1
    } else {
      suggestedRecurrence = RECURRENCE_TYPE.WEEKLY
      suggestedCount = weeksDiff + 1
    }

    return {
      daysDiff,
      weeksDiff,
      startDayOfWeek,
      dayCode,
      allDayCodes,
      suggestedRecurrence,
      suggestedCount,
      startDateFormatted: format(start, 'MMM d'),
      endDateFormatted: format(end, 'MMM d, yyyy'),
    }
  }, [initialDateRange])

  const initialValues = useMemo((): ScheduleFormData => {
    const startTime =
      initialDateRange?.startTime && initialDateRange.startTime !== SCHEDULE_FORM_DEFAULTS.EMPTY_TIME
        ? initialDateRange.startTime
        : SCHEDULE_FORM_DEFAULTS.DEFAULT_START_TIME

    return {
      classId: initialClassId || 0,
      date: initialDateRange?.startDate || format(new Date(), 'yyyy-MM-dd'),
      startTime,
      duration: SCHEDULE_FORM_DEFAULTS.DEFAULT_DURATION,
      recurrence: rangeInfo ? rangeInfo.suggestedRecurrence : RECURRENCE_TYPE.NONE,
      recurrenceDays: rangeInfo ? rangeInfo.allDayCodes : [],
      recurrenceCount: rangeInfo ? rangeInfo.suggestedCount : SCHEDULE_FORM_DEFAULTS.DEFAULT_RECURRENCE_COUNT,
    }
  }, [initialDateRange, initialClassId, rangeInfo])

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: initialValues,
  })

  const handleSubmit = async (data: ScheduleFormData) => {
    await onSubmit(data)
    form.reset()
  }

  return (
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
          {rangeInfo ? tSchedules('createRecurringSchedules') : tSchedules('scheduleNewSession')}
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
            <div className="text-xs text-foreground-muted">
              {tSchedules('daysSelected', { count: rangeInfo.daysDiff })}
            </div>
          </div>
          <Badge variant="secondary" className="flex-shrink-0">
            {rangeInfo.suggestedRecurrence === RECURRENCE_TYPE.DAILY && tSchedules('daily')}
            {rangeInfo.suggestedRecurrence === RECURRENCE_TYPE.WEEKLY && tSchedules('weekly')}
            {rangeInfo.suggestedRecurrence === RECURRENCE_TYPE.BIWEEKLY && tSchedules('biweekly')}
          </Badge>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <ScheduleFormFields
            control={form.control}
            setValue={form.setValue}
            watch={form.watch}
            classes={classes}
            locations={locations}
            isRangeSelection={!!rangeInfo}
            rangeInfo={rangeInfo ? { daysDiff: rangeInfo.daysDiff, allDayCodes: rangeInfo.allDayCodes } : null}
          />

          <FormActions
            form={form}
            rangeInfo={rangeInfo}
            isSubmitting={isSubmitting}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </Form>
    </DialogContent>
  )
}

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <ScheduleFormContent
          onOpenChange={onOpenChange}
          classes={classes}
          locations={locations}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          initialClassId={initialClassId}
          initialDateRange={initialDateRange}
        />
      )}
    </Dialog>
  )
}
