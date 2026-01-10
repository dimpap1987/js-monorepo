import { getRequestConfig } from 'next-intl/server'
import { headers } from 'next/headers'
import { isValidLocale, type Locale } from './config'
import { AppConfig } from '../lib/app-config'

/**
 * Server-side locale configuration for next-intl
 * Reads locale from x-locale header set by middleware
 */
export default getRequestConfig(async () => {
  const headersList = await headers()

  // Get locale from middleware header, fallback to default
  const headerLocale = headersList.get('x-locale')
  const locale: Locale = isValidLocale(headerLocale) ? headerLocale : AppConfig.defaultLocale

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
