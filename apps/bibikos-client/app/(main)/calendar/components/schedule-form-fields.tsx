'use client'

import { FormControl, FormField, FormItem, FormLabel } from '@js-monorepo/components/ui/form'
import { Input } from '@js-monorepo/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@js-monorepo/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@js-monorepo/components/ui/select'
import { Switch } from '@js-monorepo/components/ui/switch'
import { cn } from '@js-monorepo/ui/util'
import { useTranslations } from 'next-intl'
import { Control } from 'react-hook-form'
import { Calendar as CalendarIcon, Repeat, CalendarDays } from 'lucide-react'
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
    suggestedRecurrence: 'daily' | 'weekly' | 'biweekly'
    suggestedCount: number
    dayCode: string
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

      {/* Range Selection Mode - Simplified */}
      {isRangeSelection && rangeInfo && (
        <FormField
          control={control}
          name="recurrence"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Schedule pattern</FormLabel>
              <RadioGroup
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value)
                  // Auto-set the appropriate values based on selection
                }}
                className="space-y-2"
              >
                {/* Option 1: Daily (one session each day) */}
                <label
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                    field.value === 'daily'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-background-secondary/50'
                  )}
                >
                  <RadioGroupItem value="daily" className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-primary" />
                      <span className="font-medium">Every day in range</span>
                    </div>
                    <p className="text-sm text-foreground-muted mt-1">
                      Creates {rangeInfo.daysDiff} sessions, one for each day
                    </p>
                  </div>
                </label>

                {/* Option 2: Weekly repeat */}
                <label
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                    field.value === 'weekly'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-background-secondary/50'
                  )}
                >
                  <RadioGroupItem value="weekly" className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-primary" />
                      <span className="font-medium">Repeat weekly</span>
                    </div>
                    <p className="text-sm text-foreground-muted mt-1">
                      Creates {Math.ceil(rangeInfo.daysDiff / 7) + 1} sessions, same day each week
                    </p>
                  </div>
                </label>
              </RadioGroup>
            </FormItem>
          )}
        />
      )}

      {/* Single Date Mode - Simple Repeat Toggle */}
      {!isRangeSelection && (
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
      )}
    </div>
  )
}
