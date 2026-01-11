import { configureSite, createSiteConfigFromEnv, getSiteConfig } from '@js-monorepo/seo'

// Configure the SEO library with this app's settings
configureSite(
  createSiteConfigFromEnv({
    nameEnvVar: 'NEXT_PUBLIC_SITE_NAME',
    descriptionEnvVar: 'NEXT_PUBLIC_SITE_DESCRIPTION',
    defaults: {
      url: `https://${process.env.NEXT_PUBLIC_EL_DOMAIN}`,
      name: 'Gym Ops',
      description: 'Your fitness journey starts here',
      defaultOgImage: '/og-image.png',
      locale: 'en_US',
    },
  })
)

// Re-export for convenience
export const SITE_CONFIG = getSiteConfig()
export const SITE_NAME = SITE_CONFIG.name
export const SITE_DESCRIPTION = SITE_CONFIG.description
