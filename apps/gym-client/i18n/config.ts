import { AppConfig } from '../lib/app-config'

export const locales = AppConfig.locales
export type Locale = (typeof locales)[number]

const enHost = process.env.NEXT_PUBLIC_EN_DOMAIN
const elHost = process.env.NEXT_PUBLIC_EL_DOMAIN

if (!AppConfig.isDev && (!enHost || !elHost)) {
  throw new Error('NEXT_PUBLIC_EN_DOMAIN or NEXT_PUBLIC_EL_DOMAIN is missing')
}

const enDomain = enHost ?? 'localhost'
const elDomain = elHost ?? 'localhost'

/**
 * Domain to locale mapping
 * Supports both production domains and local development domains
 */
function getDomainLocaleMap(): Record<string, Locale> {
  return {
    // Production domains
    [enDomain]: 'en',
    [elDomain]: 'el',
    // Common development hosts
    localhost: 'en',
    '127.0.0.1': 'en',
  }
}

/**
 * Get locale from domain/host
 * Strips port if present (e.g., fitgym.gr:4200 -> fitgym.gr)
 */
export function getLocaleFromDomain(host: string): Locale {
  const hostname = host.split(':')[0]
  const domainMap = getDomainLocaleMap()
  return domainMap[hostname] ?? AppConfig.defaultLocale
}

/**
 * Get domain for a locale
 */
export function getDomainForLocale(locale: Locale): string {
  const localeToDomain: Record<Locale, string> = {
    en: enDomain,
    el: elDomain,
  }
  return localeToDomain[locale]
}

/**
 * Type guard for locale validation
 */
export function isValidLocale(value: unknown): value is Locale {
  return typeof value === 'string' && locales.includes(value as Locale)
}

const LOCALE_COOKIE = 'NEXT_LOCALE'
export { LOCALE_COOKIE }
