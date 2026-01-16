'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { useEffect, useRef } from 'react'
import { useUpdateAppUser } from '../queries'

/**
 * Hook that automatically syncs the user's browser timezone with their stored preference.
 *
 * MVP behavior: Always overwrites stored timezone with browser-detected value.
 * This ensures the user always has the correct timezone for their current location.
 *
 * Should be called once in the app layout or a global provider.
 */
export function useTimezoneSync() {
  const { session, isLoggedIn } = useSession()
  const updateAppUser = useUpdateAppUser()
  const hasSynced = useRef(false)

  useEffect(() => {
    // Only sync once per session to avoid unnecessary API calls
    if (hasSynced.current) return

    // Must be logged in and have appUser data
    if (!isLoggedIn || !session?.appUser) return

    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const storedTimezone = session.appUser.timezone

    // Sync if timezone differs
    if (storedTimezone && storedTimezone !== browserTimezone) {
      console.log(`[TimezoneSync] Updating timezone: ${storedTimezone} -> ${browserTimezone}`)
      updateAppUser.mutate({ timezone: browserTimezone })
      hasSynced.current = true
    } else if (storedTimezone === browserTimezone) {
      // Already in sync
      hasSynced.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, session?.appUser])
}

/**
 * Get the browser's current timezone
 */
export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}
