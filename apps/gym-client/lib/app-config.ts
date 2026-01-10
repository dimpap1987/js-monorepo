import { SITE_CONFIG } from './site-config'
import pkg from '@js-monorepo/package.json'

export const AppConfig = {
  appName: SITE_CONFIG.name,
  url: SITE_CONFIG.url,
  version: pkg.version,
  seo: SITE_CONFIG,
  defaultTheme: 'system',
  locale: SITE_CONFIG.locale,
  environment: process.env.NODE_ENV,
}

export const FEATURE_FLAG = {} as const
