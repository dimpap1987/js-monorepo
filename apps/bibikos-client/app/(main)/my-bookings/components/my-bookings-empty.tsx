'use client'

import { Button } from '@js-monorepo/components/ui/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { CalendarSearch } from 'lucide-react'

export function MyBookingsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <CalendarSearch className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        You haven&apos;t booked any classes yet. Discover classes from instructors and start your fitness journey!
      </p>
      <DpNextNavLink href="/discover">
        <Button>Discover Classes</Button>
      </DpNextNavLink>
    </div>
  )
}
