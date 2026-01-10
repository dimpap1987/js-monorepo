'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { locales, getDomainForLocale, type Locale } from '../i18n/config'

const localeLabels: Record<Locale, string> = {
  en: 'EN',
  el: 'EL',
}

/**
 * Locale switcher component
 * Dev: Uses query param
 * Prod: Redirects to domain
 */
export function LocaleSwitcher() {
  const currentLocale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  const isDev = process.env.NODE_ENV === 'development'

  const handleChange = (locale: Locale) => {
    if (locale === currentLocale) return

    if (isDev) {
      router.push(`${pathname}?locale=${locale}`)
    } else {
      window.location.href = `https://${getDomainForLocale(locale)}${pathname}`
    }
  }

  return (
    <div className="flex gap-1">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleChange(locale)}
          disabled={locale === currentLocale}
          className={`px-2 py-1 text-sm rounded transition-colors ${
            locale === currentLocale ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
        >
          {localeLabels[locale]}
        </button>
      ))}
    </div>
  )
}
