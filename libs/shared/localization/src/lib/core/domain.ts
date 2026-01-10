import type { DomainConfig } from './types'

/**
 * Extracts hostname from a host string (removes port if present)
 *
 * @example
 * extractHostname('example.com:3000') // 'example.com'
 * extractHostname('example.com') // 'example.com'
 */
export function extractHostname(host: string): string {
  return host.split(':')[0]
}

/**
 * Gets locale from domain/host based on domain configuration
 *
 * @example
 * const config = { domainMap: { 'example.com': 'en', 'example.gr': 'el' }, fallbackLocale: 'en' }
 * getLocaleFromDomain('example.gr:3000', config) // 'el'
 * getLocaleFromDomain('unknown.com', config) // 'en' (fallback)
 */
export function getLocaleFromDomain<TLocale extends string>(host: string, config: DomainConfig<TLocale>): TLocale {
  const hostname = extractHostname(host)
  return config.domainMap[hostname] ?? config.fallbackLocale
}

/**
 * Gets domain for a specific locale
 *
 * @example
 * const domainMap = { 'example.com': 'en', 'example.gr': 'el' }
 * getDomainForLocale('el', domainMap) // 'example.gr'
 */
export function getDomainForLocale<TLocale extends string>(
  locale: TLocale,
  domainMap: Readonly<Record<string, TLocale>>
): string | undefined {
  const entries = Object.entries(domainMap) as [string, TLocale][]
  const entry = entries.find(([, l]) => l === locale)
  return entry?.[0]
}

/**
 * Creates a reverse mapping from locale to domain
 */
export function createLocaleToDomainMap<TLocale extends string>(
  domainMap: Readonly<Record<string, TLocale>>
): Readonly<Record<TLocale, string>> {
  const entries = Object.entries(domainMap) as [string, TLocale][]
  const result = {} as Record<TLocale, string>

  for (const [domain, locale] of entries) {
    // First domain wins for each locale (in case of multiple domains per locale)
    if (!(locale in result)) {
      result[locale] = domain
    }
  }

  return Object.freeze(result)
}

/**
 * Creates a domain resolver function for a specific configuration
 *
 * @example
 * const resolveDomain = createDomainResolver({ 'example.com': 'en', 'example.gr': 'el' })
 * resolveDomain('el') // 'example.gr'
 */
export function createDomainResolver<TLocale extends string>(
  domainMap: Readonly<Record<string, TLocale>>
): (locale: TLocale) => string | undefined {
  const localeToDomain = createLocaleToDomainMap(domainMap)
  return (locale: TLocale) => localeToDomain[locale]
}
