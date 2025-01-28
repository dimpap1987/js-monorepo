'use client'

import { DpButton } from '@js-monorepo/button'
import { BOOKING_ROOM_URL } from '../contants'

export function BookButton() {
  return (
    <DpButton size="large" className="mx-auto px-6 text-white" onClick={() => window.open(BOOKING_ROOM_URL, '_blank')}>
      Book Now
    </DpButton>
  )
}
