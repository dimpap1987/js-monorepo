'use client'

import { FormControl, FormField, FormItem, FormLabel, Input } from '@js-monorepo/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@js-monorepo/components/ui/select'
import { Switch } from '@js-monorepo/components/ui/switch'
import { Calendar as CalendarIcon, Clock, Repeat } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { Control, UseFormReturn, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import {
  Class,
  DURATION_OPTIONS,
  Location,
  RECURRENCE_TYPE,
  SCHEDULE_FORM_DEFAULTS,
} from '../../../../../lib/scheduling'
import { ScheduleFormData } from '../schemas'
import { TimeSlotsList } from './time-slots-list'

interface RangeInfo {
  daysDiff: number
  allDayCodes: string[]
}

// Isolated component for recurrence toggle - no useWatch, just renders the switch
interface RecurrenceToggleProps {
  control: Control<ScheduleFormData>
}

function RecurrenceToggle({ control }: RecurrenceToggleProps) {
  const tSchedules = useTranslations('scheduling.schedules')

  return (
    <FormField
      control={control}
      name="recurrence"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-foreground-muted" />
              <FormLabel className="!mb-0">{tSchedules('repeatWeekly')}</FormLabel>
            </div>
            <Switch
              checked={field.value === RECURRENCE_TYPE.WEEKLY}
              onCheckedChange={(checked) => field.onChange(checked ? RECURRENCE_TYPE.WEEKLY : RECURRENCE_TYPE.NONE)}
            />
          </div>
        </FormItem>
      )}
    />
  )
}

// Isolated component for recurrence count input
interface RecurrenceCountInputProps {
  control: Control<ScheduleFormData>
}

function RecurrenceCountInput({ control }: RecurrenceCountInputProps) {
  const tSchedules = useTranslations('scheduling.schedules')

  return (
    <FormField
      control={control}
      name="recurrenceCount"
      render={({ field: countField }) => (
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground-muted">{tSchedules('forWeeks')}</span>
          <Input
            type="number"
            min={SCHEDULE_FORM_DEFAULTS.MIN_RECURRENCE_COUNT}
            max={SCHEDULE_FORM_DEFAULTS.MAX_RECURRENCE_COUNT}
            className="w-20"
            value={countField.value}
            onChange={(e) => countField.onChange(Number(e.target.value) || 0)}
            onBlur={countField.onBlur}
            name={countField.name}
            ref={countField.ref}
          />
          <span className="text-sm text-foreground-muted">{tSchedules('weeks')}</span>
        </div>
      )}
    />
  )
}

// Time and duration inputs for range selection mode - works with timeSlots[0]
interface RangeTimeInputProps {
  form: UseFormReturn<ScheduleFormData>
  timeInputRef: React.RefObject<HTMLInputElement>
}

function RangeTimeInput({ form, timeInputRef }: RangeTimeInputProps) {
  const tSchedules = useTranslations('scheduling.schedules')
  const [slot, setSlot] = useState(() => form.getValues('timeSlots')[0] || { startTime: '', duration: 60 })

  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name?.startsWith('timeSlots') || name === undefined) {
        const slotInner = values.timeSlots?.[0]
        setSlot({
          startTime: slotInner?.startTime ?? '',
          duration: slotInner?.duration ?? 60,
        })
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  const handleTimeChange = (value: string) => {
    form.setValue('timeSlots', [{ ...slot, startTime: value }], { shouldValidate: true })
  }

  const handleDurationChange = (value: number) => {
    form.setValue('timeSlots', [{ ...slot, duration: value }], { shouldValidate: true })
  }

  return (
    <>
      <FormItem>
        <FormLabel>{tSchedules('startTime')}</FormLabel>
        <FormControl>
          <div className="relative cursor-pointer" onClick={() => timeInputRef.current?.showPicker?.()}>
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none" />
            <Input
              type="time"
              value={slot.startTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              ref={timeInputRef}
              className="pl-10 cursor-pointer"
            />
          </div>
        </FormControl>
      </FormItem>

      <FormItem>
        <FormLabel>{tSchedules('duration')}</FormLabel>
        <Select value={slot.duration.toString()} onValueChange={(v) => handleDurationChange(Number(v))}>
          <FormControl>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {DURATION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value.toString()}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormItem>
    </>
  )
}

// Container that manages visibility via subscription - no FormField here
interface RecurrenceFieldsProps {
  control: Control<ScheduleFormData>
  setValue: UseFormSetValue<ScheduleFormData>
  watch: UseFormWatch<ScheduleFormData>
  rangeInfo: RangeInfo | null
}

function RecurrenceFields({ control, setValue, watch, rangeInfo }: RecurrenceFieldsProps) {
  const [showCount, setShowCount] = useState(() => watch('recurrence') === RECURRENCE_TYPE.WEEKLY)
  const prevRecurrence = useRef(watch('recurrence'))
  const hasMounted = useRef(false)

  useEffect(() => {
    // Subscribe to recurrence changes - updates state asynchronously
    const subscription = watch((values, { name }) => {
      if (name === 'recurrence' || name === undefined) {
        const recurrence = values.recurrence || RECURRENCE_TYPE.NONE
        setShowCount(recurrence === RECURRENCE_TYPE.WEEKLY)

        // Sync related values when recurrence changes
        if (hasMounted.current && prevRecurrence.current !== recurrence && rangeInfo) {
          if (recurrence === RECURRENCE_TYPE.DAILY) {
            setValue('recurrenceCount', rangeInfo.daysDiff)
            setValue('recurrenceDays', [])
          } else if (recurrence === RECURRENCE_TYPE.WEEKLY) {
            setValue('recurrenceDays', rangeInfo.allDayCodes)
            const weeksCount = Math.ceil(rangeInfo.daysDiff / SCHEDULE_FORM_DEFAULTS.DAYS_IN_WEEK) + 1
            setValue('recurrenceCount', weeksCount)
          }
        }
        prevRecurrence.current = recurrence
      }
    })

    hasMounted.current = true
    return () => subscription.unsubscribe()
  }, [watch, setValue, rangeInfo])

  return (
    <>
      <RecurrenceToggle control={control} />
      <div className={showCount ? 'pl-6 -mt-3' : 'hidden'}>
        <RecurrenceCountInput control={control} />
      </div>
    </>
  )
}

interface ScheduleFormFieldsProps {
  form: UseFormReturn<ScheduleFormData>
  classes: Class[]
  locations: Location[]
  isRangeSelection?: boolean
  rangeInfo: RangeInfo | null
}

export function ScheduleFormFields({ form, classes, locations, isRangeSelection, rangeInfo }: ScheduleFormFieldsProps) {
  const tSchedules = useTranslations('scheduling.schedules')
  const timeInputRef = useRef<HTMLInputElement>(null)
  const { control, setValue, watch } = form

  return (
    <div className="space-y-5">
      {/* Class Selection */}
      <FormField
        control={control}
        name="classId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{tSchedules('selectClass')}</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(Number(value))}
              value={field.value ? field.value.toString() : undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={tSchedules('selectClassPlaceholder')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {classes.map((classItem) => {
                  const location = locations.find((l) => l.id === classItem.locationId)
                  return (
                    <SelectItem key={classItem.id} value={classItem.id.toString()}>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        <span>{classItem.title}</span>
                        {location && <span className="text-foreground-muted text-xs">({location.name})</span>}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      {/* Date & Time Section */}
      {isRangeSelection ? (
        // Range selection: show date, time, and duration in a row
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tSchedules('startDate')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none" />
                    <Input type="date" {...field} readOnly className="pl-10 opacity-60" />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <RangeTimeInput form={form} timeInputRef={timeInputRef} />
        </div>
      ) : (
        // Single day selection: show date and multiple time slots with individual durations
        <div className="space-y-4">
          <FormField
            control={control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tSchedules('date')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none" />
                    <Input type="date" {...field} className="pl-10" />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <TimeSlotsList form={form} />
        </div>
      )}

      {/* Recurrence Fields - isolated to prevent render conflicts */}
      <RecurrenceFields control={control} setValue={setValue} watch={watch} rangeInfo={rangeInfo} />
    </div>
  )
}
