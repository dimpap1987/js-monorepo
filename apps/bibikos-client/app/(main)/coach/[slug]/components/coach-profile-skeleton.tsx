import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { Skeleton } from '@js-monorepo/components/ui/skeleton'
import { ContainerTemplate } from '@js-monorepo/templates'

function HeroSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-none bg-transparent">
      <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-background">
        <CardContent className="relative px-4 py-10 sm:px-8 sm:py-14">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            {/* Avatar skeleton */}
            <Skeleton className="h-28 w-28 sm:h-36 sm:w-36 rounded-full ring-4 ring-background" />

            {/* Profile info skeleton */}
            <div className="flex-1 text-center sm:text-left space-y-4 w-full">
              {/* Name */}
              <Skeleton className="h-10 w-48 mx-auto sm:mx-0" />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-16 rounded-full" />
              </div>

              {/* Class types */}
              <Skeleton className="h-5 w-64 mx-auto sm:mx-0" />

              {/* Bio */}
              <div className="space-y-2 max-w-2xl mx-auto sm:mx-0">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>

              {/* Stats */}
              <div className="pt-4 border-t border-border/50">
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

function SchedulesListSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32 mt-1" />
      </div>

      {/* Group header */}
      <Skeleton className="h-7 w-24" />

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex gap-4">
                  <Skeleton className="w-16 h-20 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                </div>
                <Skeleton className="h-10 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function CoachProfileSkeleton() {
  return (
    <ContainerTemplate className="space-y-5">
      <HeroSkeleton />
      <ContainerTemplate>
        <SchedulesListSkeleton />
      </ContainerTemplate>
    </ContainerTemplate>
  )
}
