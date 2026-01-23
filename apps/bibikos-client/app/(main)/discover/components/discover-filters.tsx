'use client'

import { Button } from '@js-monorepo/components/ui/button'
import { Input } from '@js-monorepo/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@js-monorepo/components/ui/select'
import { Search, X } from 'lucide-react'
import type { DiscoverFilters as DiscoverFiltersType } from '../../../../lib/scheduling'

const TIME_OF_DAY_OPTIONS = [
  { value: 'morning', label: 'Morning (5am - 12pm)' },
  { value: 'afternoon', label: 'Afternoon (12pm - 5pm)' },
  { value: 'evening', label: 'Evening (5pm - 5am)' },
] as const

const ACTIVITY_OPTIONS = [
  { value: 'yoga', label: 'Yoga' },
  { value: 'pilates', label: 'Pilates' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'dance', label: 'Dance' },
  { value: 'martial-arts', label: 'Martial Arts' },
  { value: 'swimming', label: 'Swimming' },
  { value: 'crossfit', label: 'CrossFit' },
  { value: 'personal-training', label: 'Personal Training' },
] as const

interface DiscoverFiltersProps {
  filters: DiscoverFiltersType
  onFilterChange: (filters: Partial<DiscoverFiltersType>) => void
  onClearFilters: () => void
}

export function DiscoverFilters({ filters, onFilterChange, onClearFilters }: DiscoverFiltersProps) {
  const hasActiveFilters = filters.activity || filters.timeOfDay || filters.search

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-sm">
          <div className="">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search classes or coaches..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange({ search: e.target.value || undefined })}
              className="pl-9"
            />
          </div>
          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7"
              variant="ghost"
              size="icon"
              onClick={onClearFilters}
              title="Clear filters"
            >
              <X />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Activity Filter */}
          <Select
            value={filters.activity || 'all'}
            onValueChange={(value) => onFilterChange({ activity: value === 'all' ? undefined : value })}
          >
            <SelectTrigger className="w-[180px] flex-1">
              <SelectValue placeholder="Activity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All activities</SelectItem>
              {ACTIVITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Time of Day Filter */}
          <Select
            value={filters.timeOfDay || 'all'}
            onValueChange={(value) =>
              onFilterChange({
                timeOfDay: value === 'all' ? undefined : (value as 'morning' | 'afternoon' | 'evening'),
              })
            }
          >
            <SelectTrigger className="w-[200px] flex-1">
              <SelectValue placeholder="Time of day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any time</SelectItem>
              {TIME_OF_DAY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
