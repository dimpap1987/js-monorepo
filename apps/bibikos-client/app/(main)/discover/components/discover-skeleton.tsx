'use client'

import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { Skeleton } from '@js-monorepo/components/ui/skeleton'

function FiltersSkeleton() {
  return (
    <div className="flex flex-wrap gap-3">
      <Skeleton className="h-10 w-[180px]" />
      <Skeleton className="h-10 w-[140px]" />
      <Skeleton className="h-10 w-[200px]" />
    </div>
  )
}

function ScheduleCardSkeleton() {
  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-4">
            <Skeleton className="w-16 h-16 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      </CardContent>
    </Card>
  )
}

function DateGroupSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-24" />
      <div className="space-y-3">
        <ScheduleCardSkeleton />
        <ScheduleCardSkeleton />
      </div>
    </div>
  )
}

export function DiscoverSkeleton() {
  return (
    <div className="space-y-8">
      <FiltersSkeleton />
      <div className="space-y-8">
        <DateGroupSkeleton />
        <DateGroupSkeleton />
      </div>
    </div>
  )
}
