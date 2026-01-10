import { createLocaleUrlGenerator, createAlternateUrlsGenerator } from '@js-monorepo/localization'
import { localizationConfig, locales, getDomainForLocale, type Locale } from '../../i18n/config'

/**
 * Get locale URL generator configured for this application
 */
const getLocaleUrlGenerator = createLocaleUrlGenerator(localizationConfig, {
  useQueryParam: localizationConfig.isDev,
})

/**
 * Get alternate URLs generator configured for this application
 */
const getAlternateUrlsGenerator = createAlternateUrlsGenerator(localizationConfig, {
  useQueryParam: localizationConfig.isDev,
})

/**
 * Get the URL for switching to a different locale
 *
 * Production: Returns full URL with correct domain
 * Development: Returns path with ?locale= query param
 */
export function getLocaleUrl(locale: Locale, pathname = '/'): string {
  return getLocaleUrlGenerator(locale, pathname)
}

/**
 * Get alternate URLs for all locales (useful for SEO hreflang tags)
 */
export function getAlternateLocaleUrls(pathname = '/'): Record<Locale, string> {
  return getAlternateUrlsGenerator(pathname)
}

// Re-export for convenience
export { locales, getDomainForLocale, type Locale }
