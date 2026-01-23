'use client'

import type { Locale as DateFnsLocale } from 'date-fns'
import { el, enUS } from 'date-fns/locale'
import { useLocale } from 'next-intl'
import { useMemo } from 'react'
import { useBibikosSession } from '../../auth'
import { DEFAULT_LOCALE, DEFAULT_TIMEZONE } from '../constants'
import type { DateTimeContext, IANATimezone } from '../types'
import { getBrowserTimezone } from '../utils/timezone'

/**
 * Map of app locales to date-fns locales
 */
const DATE_LOCALES: Record<string, DateFnsLocale> = {
  en: enUS,
  el: el,
}

/**
 * Get the date-fns locale for an app locale code
 */
export function getDateFnsLocale(appLocale: string): DateFnsLocale {
  return DATE_LOCALES[appLocale] ?? enUS
}

/**
 * Combined datetime context hook
 *
 * Provides all datetime-related context values:
 * - User's preferred timezone (from session)
 * - Browser's detected timezone
 * - date-fns locale for formatting
 * - App locale code
 *
 * @example
 * ```typescript
 * const { userTimezone, dateLocale, appLocale } = useDateTimeContext()
 * formatDate(date, DATE_FORMATS.DATE_FULL, dateLocale)
 * ```
 */
export function useDateTimeContext(): DateTimeContext {
  const appLocale = useLocale() || DEFAULT_LOCALE
  const { session } = useBibikosSession()

  return useMemo(() => {
    const userTimezone: IANATimezone = session?.appUser?.timezone || DEFAULT_TIMEZONE
    const browserTimezone: IANATimezone = getBrowserTimezone()
    const dateLocale = getDateFnsLocale(appLocale)

    return {
      userTimezone,
      browserTimezone,
      dateLocale,
      appLocale,
    }
  }, [appLocale, session?.appUser?.timezone])
}
