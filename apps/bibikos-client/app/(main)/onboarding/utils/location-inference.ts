/**
 * Infer country code from browser locale
 * Returns ISO 3166-1 alpha-2 country code (e.g., 'US', 'GR', 'GB')
 */
export function inferCountryFromLocale(): string | null {
  try {
    // Try to get country from browser locale
    const locale = navigator.language || (navigator as any).userLanguage
    if (!locale) return null

    // Handle formats like 'en-US', 'el-GR', 'fr-FR'
    const parts = locale.split('-')
    if (parts.length >= 2) {
      const countryCode = parts[parts.length - 1].toUpperCase()
      // Validate it's a 2-letter code
      if (countryCode.length === 2 && /^[A-Z]{2}$/.test(countryCode)) {
        return countryCode
      }
    }

    // Try using Intl.Locale API (more modern, better support)
    try {
      const intlLocale = new Intl.Locale(locale)
      const region = intlLocale.region
      if (region && region.length === 2) {
        return region.toUpperCase()
      }
    } catch {
      // Intl.Locale might not be available in all browsers
    }

    return null
  } catch {
    return null
  }
}

/**
 * Get inferred country code with fallback priority:
 * 1. Session appUser.countryCode (if available)
 * 2. Browser locale inference
 * 3. null (user must select)
 */
export function getInferredCountryCode(sessionCountryCode: string | null | undefined): string | null {
  // Priority 1: Use session data if available
  if (sessionCountryCode) {
    return sessionCountryCode
  }

  // Priority 2: Infer from browser locale
  return inferCountryFromLocale()
}
