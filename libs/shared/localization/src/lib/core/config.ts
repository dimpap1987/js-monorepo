import type { LocalizationConfig, LocaleConfig, DomainConfig, LocaleEnvironment } from './types'

/**
 * Default configuration values
 */
const DEFAULTS = {
  cookieName: 'NEXT_LOCALE',
  headerName: 'x-locale',
} as const

/**
 * Configuration builder options
 */
export interface LocalizationConfigOptions<TLocale extends string> {
  /** Available locales */
  locales: readonly TLocale[]
  /** Default locale */
  defaultLocale: TLocale
  /** Domain to locale mapping */
  domainMap: Record<string, TLocale>
  /** Whether running in development mode */
  isDev?: boolean
  /** Custom cookie name (default: NEXT_LOCALE) */
  cookieName?: string
  /** Custom header name (default: x-locale) */
  headerName?: string
}

/**
 * Creates a fully typed localization configuration
 *
 * Follows Open/Closed Principle - extend through configuration, not modification
 *
 * @example
 * const config = createLocalizationConfig({
 *   locales: ['en', 'el'] as const,
 *   defaultLocale: 'en',
 *   domainMap: {
 *     'example.com': 'en',
 *     'example.gr': 'el',
 *   },
 *   isDev: process.env.NODE_ENV === 'development',
 * })
 */
export function createLocalizationConfig<TLocale extends string>(
  options: LocalizationConfigOptions<TLocale>
): LocalizationConfig<TLocale> {
  const {
    locales,
    defaultLocale,
    domainMap,
    isDev = false,
    cookieName = DEFAULTS.cookieName,
    headerName = DEFAULTS.headerName,
  } = options

  // Validate that defaultLocale is in locales
  if (!locales.includes(defaultLocale)) {
    throw new Error(`Default locale "${defaultLocale}" must be included in locales: [${locales.join(', ')}]`)
  }

  return Object.freeze({
    locales,
    defaultLocale,
    domainMap: Object.freeze({ ...domainMap }),
    fallbackLocale: defaultLocale,
    isDev,
    cookieName,
    headerName,
  })
}

/**
 * Creates a partial config for locale-only operations
 */
export function createLocaleConfig<TLocale extends string>(
  locales: readonly TLocale[],
  defaultLocale: TLocale,
  options?: Partial<Pick<LocaleConfig<TLocale>, 'cookieName' | 'headerName'>>
): LocaleConfig<TLocale> {
  return Object.freeze({
    locales,
    defaultLocale,
    cookieName: options?.cookieName ?? DEFAULTS.cookieName,
    headerName: options?.headerName ?? DEFAULTS.headerName,
  })
}

/**
 * Creates a domain configuration
 */
export function createDomainConfig<TLocale extends string>(
  domainMap: Record<string, TLocale>,
  fallbackLocale: TLocale
): DomainConfig<TLocale> {
  return Object.freeze({
    domainMap: Object.freeze({ ...domainMap }),
    fallbackLocale,
  })
}

/**
 * Creates environment configuration
 */
export function createEnvironmentConfig(isDev: boolean): LocaleEnvironment {
  return Object.freeze({ isDev })
}
