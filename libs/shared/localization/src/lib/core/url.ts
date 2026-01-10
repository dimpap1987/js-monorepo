import type { LocaleConfig, DomainConfig } from './types'
import { createLocaleToDomainMap } from './domain'

/**
 * URL generation options
 */
export interface LocaleUrlOptions {
  /** Whether to use query params (dev mode) or domains (production) */
  useQueryParam?: boolean
  /** Protocol to use for full URLs (default: 'https') */
  protocol?: string
}

/**
 * Creates a URL generator for locale switching
 *
 * @example
 * const getLocaleUrl = createLocaleUrlGenerator(config, { useQueryParam: isDev })
 * getLocaleUrl('el', '/dashboard') // dev: '/dashboard?locale=el', prod: 'https://example.gr/dashboard'
 */
export function createLocaleUrlGenerator<TLocale extends string>(
  config: Pick<LocaleConfig<TLocale>, 'locales'> & Partial<DomainConfig<TLocale>>,
  options?: LocaleUrlOptions
): (locale: TLocale, pathname?: string) => string {
  const { useQueryParam = false, protocol = 'https' } = options ?? {}
  const localeToDomain: Partial<Record<TLocale, string>> = config.domainMap
    ? createLocaleToDomainMap(config.domainMap)
    : {}

  return (locale: TLocale, pathname = '/'): string => {
    if (useQueryParam) {
      const params = new URLSearchParams({ locale })
      return `${pathname}?${params.toString()}`
    }

    const domain = localeToDomain[locale]
    if (!domain) {
      // Fallback to query param if no domain mapping
      const params = new URLSearchParams({ locale })
      return `${pathname}?${params.toString()}`
    }

    return `${protocol}://${domain}${pathname}`
  }
}

/**
 * Creates alternate URLs for all locales (useful for SEO hreflang tags)
 *
 * @example
 * const getAlternates = createAlternateUrlsGenerator(config, { useQueryParam: false })
 * getAlternates('/about') // { en: 'https://example.com/about', el: 'https://example.gr/about' }
 */
export function createAlternateUrlsGenerator<TLocale extends string>(
  config: Pick<LocaleConfig<TLocale>, 'locales'> & Partial<DomainConfig<TLocale>>,
  options?: LocaleUrlOptions
): (pathname?: string) => Record<TLocale, string> {
  const urlGenerator = createLocaleUrlGenerator(config, options)

  return (pathname = '/'): Record<TLocale, string> => {
    const result = {} as Record<TLocale, string>
    for (const locale of config.locales) {
      result[locale] = urlGenerator(locale, pathname)
    }
    return result
  }
}

/**
 * Simple utility to get locale URL
 * Convenience wrapper for one-off usage
 */
export function getLocaleUrl<TLocale extends string>(
  locale: TLocale,
  pathname: string,
  domainMap: Readonly<Record<string, TLocale>>,
  options?: LocaleUrlOptions
): string {
  const generator = createLocaleUrlGenerator({ locales: [locale], domainMap }, options)
  return generator(locale, pathname)
}

/**
 * Get alternate URLs for all locales
 * Convenience wrapper for one-off usage
 */
export function getAlternateUrls<TLocale extends string>(
  locales: readonly TLocale[],
  pathname: string,
  domainMap: Readonly<Record<string, TLocale>>,
  options?: LocaleUrlOptions
): Record<TLocale, string> {
  const generator = createAlternateUrlsGenerator({ locales, domainMap }, options)
  return generator(pathname)
}
