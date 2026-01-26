'use client'

import { Button } from '@js-monorepo/components/ui/button'
import { FormLabel, Input } from '@js-monorepo/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@js-monorepo/components/ui/select'
import { Clock, Plus, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { DURATION_OPTIONS, SCHEDULE_FORM_DEFAULTS } from '../../../../../lib/scheduling'
import { ScheduleFormData, TimeSlot } from '../schemas'

interface TimeSlotsListProps {
  form: UseFormReturn<ScheduleFormData>
}

export function TimeSlotsList({ form }: TimeSlotsListProps) {
  const tSchedules = useTranslations('scheduling.schedules')
  const timeInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(() => form.getValues('timeSlots'))

  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name?.startsWith('timeSlots') || name === undefined) {
        const normalizedSlots =
          values.timeSlots
            ?.filter((slot): slot is { startTime?: string; duration?: number } => slot != null)
            .map((slot) => ({
              startTime: slot.startTime ?? '',
              duration: slot.duration ?? 60,
            })) ?? []

        setTimeSlots(normalizedSlots)
      }
    })

    return () => subscription.unsubscribe()
  }, [form])

  const handleTimeChange = (index: number, value: string) => {
    const newSlots = [...timeSlots]
    newSlots[index] = { ...newSlots[index], startTime: value }
    form.setValue('timeSlots', newSlots, { shouldValidate: true })
  }

  const handleDurationChange = (index: number, value: number) => {
    const newSlots = [...timeSlots]
    newSlots[index] = { ...newSlots[index], duration: value }
    form.setValue('timeSlots', newSlots, { shouldValidate: true })
  }

  const handleAddSlot = () => {
    const lastSlot = timeSlots[timeSlots.length - 1]
    const newSlots = [
      ...timeSlots,
      {
        startTime: SCHEDULE_FORM_DEFAULTS.DEFAULT_START_TIME,
        duration: lastSlot?.duration || SCHEDULE_FORM_DEFAULTS.DEFAULT_DURATION,
      },
    ]
    form.setValue('timeSlots', newSlots, { shouldValidate: true })
  }

  const handleRemoveSlot = (index: number) => {
    if (timeSlots.length <= 1) return
    const newSlots = timeSlots.filter((_, i) => i !== index)
    form.setValue('timeSlots', newSlots, { shouldValidate: true })
  }

  return (
    <div className="space-y-3">
      <FormLabel>{tSchedules('sessions')}</FormLabel>

      <div className="space-y-2">
        {timeSlots.map((slot, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="relative flex-1 cursor-pointer"
              onClick={() => timeInputRefs.current[index]?.showPicker?.()}
            >
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none" />
              <Input
                type="time"
                value={slot.startTime}
                onChange={(e) => handleTimeChange(index, e.target.value)}
                ref={(el) => {
                  timeInputRefs.current[index] = el
                }}
                className="pl-10 cursor-pointer"
              />
            </div>

            <Select
              value={slot.duration.toString()}
              onValueChange={(value) => handleDurationChange(index, Number(value))}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {timeSlots.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-foreground-muted hover:text-destructive flex-shrink-0"
                onClick={() => handleRemoveSlot(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleAddSlot}>
        <Plus className="w-4 h-4 mr-2" />
        {tSchedules('addAnotherTime')}
      </Button>
    </div>
  )
}
