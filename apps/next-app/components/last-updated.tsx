'use client'

import { useTimezone } from '@js-monorepo/next/hooks'
import { formatForUser } from '@js-monorepo/utils/date'

export function LastUpdated() {
  const userTimezone = useTimezone()
  const currentDate = formatForUser(new Date(), userTimezone, 'PPPpp')
  return <p className="text-muted-foreground mb-8">Last updated: {currentDate}</p>
}
