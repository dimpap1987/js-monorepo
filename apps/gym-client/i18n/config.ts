import {
  createDomainResolver,
  createLocaleValidator,
  createLocalizationConfig,
  type LocalizationConfig,
} from '@js-monorepo/localization'
import { AppConfig } from '../lib/app-config'

/**
 * Application-specific locale type
 */
export type Locale = (typeof AppConfig.locales)[number]

const enHost = process.env.NEXT_PUBLIC_EN_DOMAIN
const elHost = process.env.NEXT_PUBLIC_EL_DOMAIN

// NEXT_PUBLIC_* env vars are injected at build time into the static bundle
// If missing at build time, they won't be available at runtime either
// In production, these should always be set during build
if (!AppConfig.isDev && (!enHost || !elHost)) {
  throw new Error('NEXT_PUBLIC_EN_DOMAIN or NEXT_PUBLIC_EL_DOMAIN is missing')
}

const enDomain = enHost ?? 'localhost'
const elDomain = elHost ?? 'localhost'

/**
 * Domain to locale mapping
 */
const domainMap: Record<string, Locale> = {
  [enDomain]: 'en',
  [elDomain]: 'el',
  localhost: 'en',
  '127.0.0.1': 'en',
}

/**
 * Full localization configuration for the application
 */
export const localizationConfig: LocalizationConfig<Locale> = createLocalizationConfig({
  locales: AppConfig.locales,
  defaultLocale: AppConfig.defaultLocale as Locale,
  domainMap,
  isDev: AppConfig.isDev,
})

// Re-export commonly used values for convenience
export const locales = localizationConfig.locales
export const LOCALE_COOKIE = localizationConfig.cookieName
export const LOCALE_HEADER = localizationConfig.headerName

/**
 * Type guard for locale validation
 */
export const isValidLocale = createLocaleValidator(locales)

/**
 * Get domain for a specific locale
 */
export const getDomainForLocale = createDomainResolver(domainMap)

/**
 * Get locale from domain/host
 */
export { getLocaleFromDomain } from '@js-monorepo/localization'
