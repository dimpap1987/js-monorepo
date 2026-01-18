'use client'

import { Button } from '@js-monorepo/components/ui/button'
import { Calendar, Search } from 'lucide-react'

interface DiscoverEmptyStateProps {
  hasFilters: boolean
  onClearFilters: () => void
}

export function DiscoverEmptyState({ hasFilters, onClearFilters }: DiscoverEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {hasFilters ? (
          <Search className="w-8 h-8 text-muted-foreground" />
        ) : (
          <Calendar className="w-8 h-8 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {hasFilters ? 'No classes match your filters' : 'No upcoming classes'}
      </h3>
      <p className="text-muted-foreground max-w-sm mb-4">
        {hasFilters
          ? 'Try adjusting your filters or search terms to find more classes.'
          : 'There are no classes scheduled in this date range. Check back later!'}
      </p>
      {hasFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  )
}
