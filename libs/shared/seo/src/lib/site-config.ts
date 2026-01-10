/**
 * Site configuration interface
 * Each app provides its own implementation
 */
export interface SiteConfig {
  /** Site name displayed in titles and metadata */
  name: string
  /** Base URL of the site (e.g., 'https://example.com') */
  url: string
  /** Default site description for SEO */
  description: string
  /** Default OG image path relative to site URL */
  defaultOgImage?: string
  /** Default locale for Open Graph */
  locale?: string
}

const DEFAULT_CONFIG: SiteConfig = {
  name: 'My App',
  url: 'https://example.com',
  description: 'A modern web application',
  defaultOgImage: '/og-image.png',
  locale: 'en_US',
}

let siteConfig: SiteConfig = DEFAULT_CONFIG

/**
 * Configure the site settings for SEO.
 * Call this once at app initialization.
 *
 * @example
 * ```typescript
 * // In your app's initialization (e.g., layout.tsx or _app.tsx)
 * import { configureSite } from '@js-monorepo/seo'
 *
 * configureSite({
 *   name: 'My Awesome App',
 *   url: 'https://myawesomeapp.com',
 *   description: 'The best app ever',
 * })
 * ```
 */
export function configureSite(config: SiteConfig): void {
  siteConfig = { ...DEFAULT_CONFIG, ...config }
}

/**
 * Get the current site configuration
 */
export function getSiteConfig(): SiteConfig {
  return siteConfig
}

/**
 * Create a site config from environment variables.
 * Useful for Next.js apps that use NEXT_PUBLIC_* env vars.
 *
 * @example
 * ```typescript
 * configureSite(createSiteConfigFromEnv({
 *   nameEnvVar: 'NEXT_PUBLIC_SITE_NAME',
 *   urlEnvVar: 'NEXT_PUBLIC_SITE_URL',
 *   descriptionEnvVar: 'NEXT_PUBLIC_SITE_DESCRIPTION',
 *   defaults: {
 *     name: 'My App',
 *     url: 'https://example.com',
 *     description: 'Default description',
 *   },
 * }))
 * ```
 */
export function createSiteConfigFromEnv(options: {
  nameEnvVar?: string
  urlEnvVar?: string
  descriptionEnvVar?: string
  defaults: SiteConfig
}): SiteConfig {
  const { nameEnvVar, urlEnvVar, descriptionEnvVar, defaults } = options

  return {
    name: (nameEnvVar ? process.env[nameEnvVar] : undefined) || defaults.name,
    url: (urlEnvVar ? process.env[urlEnvVar] : undefined) || defaults.url,
    description: (descriptionEnvVar ? process.env[descriptionEnvVar] : undefined) || defaults.description,
    defaultOgImage: defaults.defaultOgImage,
    locale: defaults.locale,
  }
}
