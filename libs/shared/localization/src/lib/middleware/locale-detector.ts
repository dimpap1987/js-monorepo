import type { LocalizationConfig, LocaleDetectionResult, LocaleSource } from '../core/types'
import { getLocaleFromDomain } from '../core/domain'
import { createLocaleValidator } from '../core/validation'

/**
 * Request abstraction for locale detection
 * Allows the detector to work with any request type (Next.js, Express, etc.)
 */
export interface LocaleDetectionRequest {
  /** Get a cookie value by name */
  getCookie(name: string): string | undefined
  /** Get a query parameter value */
  getQueryParam(name: string): string | undefined
  /** Get the host header */
  getHost(): string
}

/**
 * Locale detection options
 */
export interface LocaleDetectorOptions {
  /** Allow query param override (typically dev-only) */
  allowQueryOverride?: boolean
  /** Allow cookie-based preference (typically dev-only) */
  allowCookiePreference?: boolean
}

/**
 * Creates a locale detector function
 *
 * Detection priority:
 * 1. Query param (if allowed) - dev override
 * 2. Cookie (if allowed) - persisted preference
 * 3. Domain-based detection
 * 4. Default locale fallback
 *
 * Follows Single Responsibility Principle - only handles locale detection
 */
export function createLocaleDetector<TLocale extends string>(
  config: LocalizationConfig<TLocale>
): (request: LocaleDetectionRequest, options?: LocaleDetectorOptions) => LocaleDetectionResult<TLocale> {
  const isValidLocale = createLocaleValidator(config.locales)

  return (request: LocaleDetectionRequest, options?: LocaleDetectorOptions): LocaleDetectionResult<TLocale> => {
    const { allowQueryOverride = config.isDev, allowCookiePreference = config.isDev } = options ?? {}

    // 1. Check query param (dev override)
    if (allowQueryOverride) {
      const queryLocale = request.getQueryParam('locale')
      if (queryLocale && isValidLocale(queryLocale)) {
        return {
          locale: queryLocale,
          shouldPersist: true,
          source: 'query',
        }
      }
    }

    // 2. Check cookie (persisted preference)
    if (allowCookiePreference) {
      const cookieLocale = request.getCookie(config.cookieName)
      if (cookieLocale && isValidLocale(cookieLocale)) {
        return {
          locale: cookieLocale,
          shouldPersist: false,
          source: 'cookie',
        }
      }
    }

    // 3. Domain-based detection
    const host = request.getHost()
    const domainLocale = getLocaleFromDomain(host, config)

    if (domainLocale !== config.fallbackLocale || config.domainMap[host.split(':')[0]]) {
      return {
        locale: domainLocale,
        shouldPersist: false,
        source: 'domain',
      }
    }

    // 4. Default fallback
    return {
      locale: config.defaultLocale,
      shouldPersist: false,
      source: 'default',
    }
  }
}

/**
 * Simple factory for creating a request adapter from common request properties
 */
export function createRequestAdapter(
  getCookie: (name: string) => string | undefined,
  getQueryParam: (name: string) => string | undefined,
  getHost: () => string
): LocaleDetectionRequest {
  return { getCookie, getQueryParam, getHost }
}
