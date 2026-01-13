'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@js-monorepo/components/ui/card'
import { Skeleton } from '@js-monorepo/components/ui/skeleton'

export function PricingCardSkeleton() {
  return (
    <Card className="relative flex flex-col w-full">
      <CardHeader className="text-center pb-2">
        {/* Plan name */}
        <Skeleton className="h-7 w-32 mx-auto" />
        {/* Description */}
        <Skeleton className="h-4 w-48 mx-auto mt-2" />
      </CardHeader>

      <CardContent className="flex-1">
        {/* Price */}
        <div className="text-center mb-6">
          <Skeleton className="h-10 w-24 mx-auto" />
        </div>

        {/* Features */}
        <ul className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-start gap-3">
              <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
              <Skeleton className="h-4 flex-1" />
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Skeleton className="h-11 w-full rounded-md" />
      </CardFooter>
    </Card>
  )
}
