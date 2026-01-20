'use client'

import { CardDescription } from '@js-monorepo/components/ui/card'
import type { BookingStatsProps } from '../types'

export function BookingStats({ total, booked, waitlisted }: BookingStatsProps) {
  return (
    <CardDescription>
      {total} total • {booked} booked • {waitlisted} waitlisted
    </CardDescription>
  )
}
