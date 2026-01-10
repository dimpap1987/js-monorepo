import { configureSite, createSiteConfigFromEnv, getSiteConfig } from '@js-monorepo/seo'

// Configure the SEO library with this app's settings
configureSite(
  createSiteConfigFromEnv({
    nameEnvVar: 'NEXT_PUBLIC_SITE_NAME',
    urlEnvVar: 'NEXT_PUBLIC_SITE_URL',
    descriptionEnvVar: 'NEXT_PUBLIC_SITE_DESCRIPTION',
    defaults: {
      name: 'Gym Client',
      url: process.env.SITE_URL || 'https://gym.yourdomain.com',
      description: 'Your fitness journey starts here',
      defaultOgImage: '/og-image.png',
      locale: 'en_US',
    },
  })
)

// Re-export for convenience
export const SITE_CONFIG = getSiteConfig()
export const SITE_NAME = SITE_CONFIG.name
export const SITE_URL = SITE_CONFIG.url
export const SITE_DESCRIPTION = SITE_CONFIG.description
