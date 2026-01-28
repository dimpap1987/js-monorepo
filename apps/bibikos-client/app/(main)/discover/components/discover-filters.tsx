'use client'

import { Button } from '@js-monorepo/components/ui/button'
import { Input } from '@js-monorepo/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@js-monorepo/components/ui/select'
import { Search, X } from 'lucide-react'
import { TagFilter } from '../../../../components/tag-select'
import type { DiscoverFilters as DiscoverFiltersType } from '../../../../lib/scheduling'

const TIME_OF_DAY_OPTIONS = [
  { value: 'morning', label: 'Morning (5am - 12pm)' },
  { value: 'afternoon', label: 'Afternoon (12pm - 5pm)' },
  { value: 'evening', label: 'Evening (5pm - 5am)' },
] as const

interface DiscoverFiltersProps {
  filters: DiscoverFiltersType
  onFilterChange: (filters: Partial<DiscoverFiltersType>) => void
  onClearFilters: () => void
}

export function DiscoverFilters({ filters, onFilterChange, onClearFilters }: DiscoverFiltersProps) {
  // const hasActiveFilters = (filters.tagIds && filters.tagIds.length > 0) || filters.timeOfDay || filters.search

  const handleTagChange = (tagIds: number[]) => {
    onFilterChange({ tagIds: tagIds.length > 0 ? tagIds : undefined })
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row gap-3 justify-between">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search classes or instructors..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value || undefined })}
            className="pl-9"
          />
          {!!filters.search && (
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

        {/* Time of Day Filter */}
        <Select
          value={filters.timeOfDay || 'all'}
          onValueChange={(value) =>
            onFilterChange({
              timeOfDay: value === 'all' ? undefined : (value as 'morning' | 'afternoon' | 'evening'),
            })
          }
        >
          <SelectTrigger className="sm:w-[200px]">
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

      {/* Tag Filters */}
      <TagFilter
        entityType="CLASS"
        value={filters.tagIds || []}
        onChange={handleTagChange}
        showAllOption={true}
        allLabel="All"
      />
    </div>
  )
}
