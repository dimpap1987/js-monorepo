'use client'

import { Button } from '@js-monorepo/components/ui/button'
import { BOOKING_ROOM_URL } from '../contants'

export function BookButton() {
  return (
    <Button size="lg" className="mx-auto px-6 text-white" onClick={() => window.open(BOOKING_ROOM_URL, '_blank')}>
      Reserve Your Spot
    </Button>
  )
}
