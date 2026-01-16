'use client'

import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@js-monorepo/components/ui/form'
import { Input } from '@js-monorepo/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@js-monorepo/components/ui/select'
import { cn } from '@js-monorepo/ui/util'
import { useTranslations } from 'next-intl'
import { Control } from 'react-hook-form'
import { Calendar as CalendarIcon } from 'lucide-react'
import { ScheduleFormData } from '../schemas'
import { Class, Location, DURATION_OPTIONS, RECURRENCE_OPTIONS, DAYS_OF_WEEK } from '../../../../lib/scheduling'

interface ScheduleFormFieldsProps {
  control: Control<ScheduleFormData>
  classes: Class[]
  locations: Location[]
  recurrence: string
  isRangeSelection?: boolean
}

export function ScheduleFormFields({
  control,
  classes,
  locations,
  recurrence,
  isRangeSelection,
}: ScheduleFormFieldsProps) {
  const tSchedules = useTranslations('scheduling.schedules')

  return (
    <>
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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tSchedules('date')}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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

      <FormField
        control={control}
        name="recurrence"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              {tSchedules('recurrenceRule')}
              {isRangeSelection && recurrence !== 'none' && (
                <span className="text-xs text-primary font-normal">(from selection)</span>
              )}
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {RECURRENCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      {recurrence !== 'none' && (
        <>
          <FormField
            control={control}
            name="recurrenceDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tSchedules('daysOfWeek')}</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => {
                        const current = field.value || []
                        if (current.includes(day.value)) {
                          field.onChange(current.filter((d) => d !== day.value))
                        } else {
                          field.onChange([...current, day.value])
                        }
                      }}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        field.value?.includes(day.value)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background-secondary hover:bg-background-secondary/80 border border-border'
                      )}
                    >
                      {day.short}
                    </button>
                  ))}
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="recurrenceCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of occurrences</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="52" {...field} />
                </FormControl>
                <FormDescription>How many times should this class repeat?</FormDescription>
              </FormItem>
            )}
          />
        </>
      )}
    </>
  )
}
