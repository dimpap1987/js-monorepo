'use client'

import { useLocale } from 'next-intl'
import { enUS, el } from 'date-fns/locale'
import type { Locale as DateFnsLocale } from 'date-fns'

const DATE_LOCALES: Record<string, DateFnsLocale> = {
  en: enUS,
  el: el,
}

/**
 * Hook to get the date-fns locale based on the current app locale
 */
export function useDateLocale(): DateFnsLocale {
  const locale = useLocale()
  return DATE_LOCALES[locale] ?? enUS
}
