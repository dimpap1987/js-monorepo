'use client'

import { useLocale } from 'next-intl'
import { useRouter } from 'next-nprogress-bar'
import { usePathname } from 'next/navigation'
import { getDomainForLocale, locales, type Locale } from '../i18n/config'
import { AppConfig } from '../lib/app-config'

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

  const handleChange = (locale: Locale) => {
    if (locale === currentLocale) return

    if (AppConfig.isDev) {
      router.push(`${pathname}?locale=${locale}`)
      router.refresh()
    } else {
      window.location.href = `https://${getDomainForLocale(locale)}${pathname}`
    }
  }

  return (
    <div className="flex">
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
