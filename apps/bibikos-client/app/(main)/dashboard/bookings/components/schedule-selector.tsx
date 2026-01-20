'use client'

import { Badge } from '@js-monorepo/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@js-monorepo/components/ui/card'
import { Input } from '@js-monorepo/components/ui/form'
import { Label } from '@js-monorepo/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@js-monorepo/components/ui/select'
import { cn } from '@js-monorepo/ui/util'
import { ClassSchedule } from '../../../../../lib/scheduling'
import { format, parseISO } from 'date-fns'
import { CalendarOff, Check } from 'lucide-react'
import type { ScheduleSelectorProps } from '../types'

export function ScheduleSelector({
  schedules,
  classes,
  selectedScheduleId,
  selectedClassId,
  dateRange,
  onScheduleSelect,
  onClassFilterChange,
  onDateRangeChange,
}: ScheduleSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Schedule</CardTitle>
        <CardDescription>Choose a schedule to view its bookings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="space-y-2">
              <Label>Filter by Class</Label>
              <Select value={selectedClassId} onValueChange={onClassFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={String(cls.id)}>
                      {cls.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex gap-2 flex-wrap md:flex-nowrap">
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                  className="cursor-pointer"
                  onClick={(e) => {
                    // Ensure the input receives focus and opens the date picker
                    e.currentTarget.showPicker?.()
                  }}
                  onFocus={(e) => {
                    // Open date picker on focus for better UX
                    e.currentTarget.showPicker?.()
                  }}
                />
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                  className="cursor-pointer"
                  onClick={(e) => {
                    // Ensure the input receives focus and opens the date picker
                    e.currentTarget.showPicker?.()
                  }}
                  onFocus={(e) => {
                    // Open date picker on focus for better UX
                    e.currentTarget.showPicker?.()
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Schedule List */}
        {schedules.length === 0 ? (
          <div className="text-center py-8 text-foreground-muted">
            <CalendarOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No schedules found for the selected filters</p>
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
            {schedules.map((schedule: ClassSchedule) => {
              const startTime = parseISO(schedule.startTimeUtc)
              const isSelected = selectedScheduleId === schedule.id
              return (
                <Card
                  key={schedule.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    isSelected && 'border-primary shadow-md'
                  )}
                  onClick={() => onScheduleSelect(schedule.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{schedule.class?.title}</h3>
                        <p className="text-sm text-foreground-muted">
                          {format(startTime, 'EEEE, MMMM d, yyyy')} • {format(startTime, 'h:mm a')} -{' '}
                          {format(parseISO(schedule.endTimeUtc), 'h:mm a')}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="secondary">{schedule.bookingCounts?.booked || 0} booked</Badge>
                          {schedule.bookingCounts &&
                            schedule.bookingCounts.waitlisted &&
                            schedule.bookingCounts.waitlisted > 0 && (
                              <Badge variant="outline">{schedule.bookingCounts.waitlisted} waitlisted</Badge>
                            )}
                        </div>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-primary" />}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
