import { SITE_CONFIG } from './seo/site-config'
import pkg from '@js-monorepo/package.json'

export const AppConfig = {
  appName: SITE_CONFIG.name,
  url: SITE_CONFIG.url,
  version: pkg.version,
  seo: SITE_CONFIG,
  defaultTheme: 'tokyonight',
  locales: ['en', 'el'],
  defaultLocale: 'en',
  environment: process.env.NODE_ENV,
  isDev: process.env.NODE_ENV === 'development',
} as const

export const FEATURE_FLAG = {} as const
