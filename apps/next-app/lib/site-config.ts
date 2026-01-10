import { configureSite, createSiteConfigFromEnv, getSiteConfig } from '@js-monorepo/seo'

// Configure the SEO library with this app's settings
configureSite(
  createSiteConfigFromEnv({
    nameEnvVar: 'NEXT_PUBLIC_SITE_NAME',
    urlEnvVar: 'NEXT_PUBLIC_SITE_URL',
    descriptionEnvVar: 'NEXT_PUBLIC_SITE_DESCRIPTION',
    defaults: {
      name: 'My Super App',
      url: process.env.SITE_URL || 'https://yourdomain.com',
      description: 'A modern web application built with Next.js',
      defaultOgImage: '/og-image.png',
      locale: 'en_US',
    },
  })
)

// Re-export for backwards compatibility
export const SITE_CONFIG = getSiteConfig()
export const SITE_NAME = SITE_CONFIG.name
export const SITE_URL = SITE_CONFIG.url
export const SITE_DESCRIPTION = SITE_CONFIG.description
