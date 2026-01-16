'use client'

import { PropsWithChildren } from 'react'
import { useTimezoneSync } from '../hooks/use-timezone-sync'

/**
 * Provider component for scheduling-related side effects.
 * Currently handles:
 * - Timezone synchronization (auto-updates user timezone to match browser)
 *
 * Add this provider to your app layout to enable these features.
 */
export function SchedulingProvider({ children }: PropsWithChildren) {
  // Sync user's timezone with browser on login
  useTimezoneSync()

  return <>{children}</>
}
