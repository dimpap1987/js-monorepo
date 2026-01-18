'use client'

import { FormControl, FormField, FormItem, FormLabel } from '@js-monorepo/components/ui/form'
import { Input } from '@js-monorepo/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@js-monorepo/components/ui/select'
import { Switch } from '@js-monorepo/components/ui/switch'
import { useTranslations } from 'next-intl'
import { Control } from 'react-hook-form'
import { Calendar as CalendarIcon, Repeat } from 'lucide-react'
import { ScheduleFormData } from '../schemas'
import { Class, Location, DURATION_OPTIONS } from '../../../../lib/scheduling'

interface ScheduleFormFieldsProps {
  control: Control<ScheduleFormData>
  classes: Class[]
  locations: Location[]
  recurrence: string
  isRangeSelection?: boolean
  rangeInfo?: {
    daysDiff: number
    weeksDiff: number
    startDayOfWeek: number
    suggestedRecurrence: 'daily' | 'weekly' | 'biweekly'
    suggestedCount: number
    dayCode: string
    startDateFormatted: string
    endDateFormatted: string
  } | null
}

export function ScheduleFormFields({
  control,
  classes,
  locations,
  recurrence,
  isRangeSelection,
  rangeInfo,
}: ScheduleFormFieldsProps) {
  const tSchedules = useTranslations('scheduling.schedules')

  return (
    <div className="space-y-5">
      {/* Class Selection */}
      <FormField
        control={control}
        name="classId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{tSchedules('selectClass')}</FormLabel>
            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
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

      {/* Date & Time Row */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isRangeSelection ? 'Start date' : tSchedules('date')}</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  disabled={isRangeSelection}
                  className={isRangeSelection ? 'opacity-60' : ''}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tSchedules('startTime')}</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Duration */}
      <FormField
        control={control}
        name="duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{tSchedules('duration')}</FormLabel>
            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
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
        )}
      />

      {/* Repeat Weekly Toggle - Same for both single and range selection */}
      <FormField
        control={control}
        name="recurrence"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-foreground-muted" />
                <FormLabel className="!mb-0">Repeat weekly</FormLabel>
              </div>
              <Switch
                checked={field.value === 'weekly'}
                onCheckedChange={(checked) => field.onChange(checked ? 'weekly' : 'none')}
              />
            </div>
            {field.value === 'weekly' && (
              <div className="mt-3 pl-6">
                <FormField
                  control={control}
                  name="recurrenceCount"
                  render={({ field: countField }) => (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground-muted">for</span>
                      <Input type="number" min="2" max="52" className="w-20" {...countField} />
                      <span className="text-sm text-foreground-muted">weeks</span>
                    </div>
                  )}
                />
              </div>
            )}
          </FormItem>
        )}
      />
    </div>
  )
}
