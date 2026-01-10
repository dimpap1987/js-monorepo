import { locales, getDomainForLocale, type Locale } from '../../i18n/config'

/**
 * Get the URL for switching to a different locale
 *
 * Production: Returns full URL with correct domain
 * Development: Returns path with ?locale= query param
 */
export function getLocaleUrl(locale: Locale, pathname = '/'): string {
  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) {
    const params = new URLSearchParams({ locale })
    return `${pathname}?${params.toString()}`
  }

  const domain = getDomainForLocale(locale)
  return `https://${domain}${pathname}`
}

/**
 * Get alternate URLs for all locales (useful for SEO hreflang tags)
 */
export function getAlternateLocaleUrls(pathname = '/'): Record<Locale, string> {
  return locales.reduce(
    (acc, locale) => {
      acc[locale] = getLocaleUrl(locale, pathname)
      return acc
    },
    {} as Record<Locale, string>
  )
}

// Re-export for convenience
export { locales, getDomainForLocale, type Locale }
