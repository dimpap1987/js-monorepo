'use client'

import { Input } from '@js-monorepo/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@js-monorepo/components/ui/select'
import { Separator } from '@js-monorepo/components/ui/separator'
import { Search } from 'lucide-react'
import { BOOKING_STATUS } from '../../../../../lib/scheduling'
import type { BookingFiltersProps } from '../types'

export function BookingFilters({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}: BookingFiltersProps) {
  return (
    <>
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <Input
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="min-w-[150px]">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value={BOOKING_STATUS.BOOKED}>Booked</SelectItem>
              <SelectItem value={BOOKING_STATUS.WAITLISTED}>Waitlisted</SelectItem>
              <SelectItem value={BOOKING_STATUS.CANCELLED}>Cancelled</SelectItem>
              <SelectItem value={BOOKING_STATUS.ATTENDED}>Attended</SelectItem>
              <SelectItem value={BOOKING_STATUS.NO_SHOW}>No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Separator />
    </>
  )
}
