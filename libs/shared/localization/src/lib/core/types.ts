/**
 * Core types for the localization system
 *
 * Follows Interface Segregation Principle (ISP) - small, focused interfaces
 */

/**
 * Base locale configuration interface
 * Applications must provide this configuration to use the localization system
 */
export interface LocaleConfig<TLocale extends string = string> {
  /** Available locales in the application */
  readonly locales: readonly TLocale[]
  /** Default locale when none is detected */
  readonly defaultLocale: TLocale
  /** Cookie name for storing locale preference */
  readonly cookieName: string
  /** Header name for passing locale to server components */
  readonly headerName: string
}

/**
 * Domain-to-locale mapping configuration
 * Used for domain-based locale detection (e.g., example.com -> en, example.gr -> el)
 */
export interface DomainConfig<TLocale extends string = string> {
  /** Map of domain/hostname to locale */
  readonly domainMap: Readonly<Record<string, TLocale>>
  /** Fallback locale when domain is not found in map */
  readonly fallbackLocale: TLocale
}

/**
 * Environment configuration for locale detection behavior
 */
export interface LocaleEnvironment {
  /** Whether the app is running in development mode */
  readonly isDev: boolean
}

/**
 * Combined configuration for the full localization system
 */
export interface LocalizationConfig<TLocale extends string = string>
  extends LocaleConfig<TLocale>,
    DomainConfig<TLocale>,
    LocaleEnvironment {}

/**
 * Locale detection result from middleware
 */
export interface LocaleDetectionResult<TLocale extends string = string> {
  /** The detected locale */
  readonly locale: TLocale
  /** Whether the locale should be persisted to cookie */
  readonly shouldPersist: boolean
  /** Source of the locale detection */
  readonly source: LocaleSource
}

/**
 * Source of locale detection
 */
export type LocaleSource = 'query' | 'cookie' | 'domain' | 'default'

/**
 * Middleware chain handler interface
 * Follows Chain of Responsibility pattern for extensible middleware
 */
export interface MiddlewareHandler<TRequest = unknown, TResponse = unknown> {
  /** Handle the request, optionally passing to next handler */
  handle(request: TRequest, next: () => TResponse): TResponse
}
