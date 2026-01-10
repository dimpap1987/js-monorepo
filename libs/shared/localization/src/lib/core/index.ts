// Types
export type {
  LocaleConfig,
  DomainConfig,
  LocaleEnvironment,
  LocalizationConfig,
  LocaleDetectionResult,
  LocaleSource,
  MiddlewareHandler,
} from './types'

// Configuration
export {
  createLocalizationConfig,
  createLocaleConfig,
  createDomainConfig,
  createEnvironmentConfig,
  type LocalizationConfigOptions,
} from './config'

// Validation
export { createLocaleValidator, createLocaleValidatorFromConfig } from './validation'

// Domain utilities
export {
  extractHostname,
  getLocaleFromDomain,
  getDomainForLocale,
  createLocaleToDomainMap,
  createDomainResolver,
} from './domain'

// URL utilities
export {
  createLocaleUrlGenerator,
  createAlternateUrlsGenerator,
  getLocaleUrl,
  getAlternateUrls,
  type LocaleUrlOptions,
} from './url'
