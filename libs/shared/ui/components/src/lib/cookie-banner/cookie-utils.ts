export const COOKIE_CONSENT_KEY = 'cookie-consent'
export const COOKIE_PREFERENCES_KEY = 'cookie-preferences'
export const COOKIE_CONSENT_VALUE = 'accepted'

export const COOKIE_CATEGORY_IDS = {
  ESSENTIAL: 'essential',
  METRICS: 'metrics',
} as const

export type CookieCategoryId = (typeof COOKIE_CATEGORY_IDS)[keyof typeof COOKIE_CATEGORY_IDS]

export interface CookiePreferences {
  [COOKIE_CATEGORY_IDS.ESSENTIAL]: boolean
  [categoryId: string]: boolean
}

export function hasAcceptedCookies(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(COOKIE_CONSENT_KEY) === COOKIE_CONSENT_VALUE
}

export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem(COOKIE_PREFERENCES_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored) as CookiePreferences
  } catch {
    return null
  }
}

export function isCookieCategoryEnabled(categoryId: string): boolean {
  const preferences = getCookiePreferences()
  if (!preferences) return false

  if (categoryId === COOKIE_CATEGORY_IDS.ESSENTIAL) return true

  return preferences[categoryId] === true
}

export function setCookiePreferences(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') return

  localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences))
  localStorage.setItem(COOKIE_CONSENT_KEY, COOKIE_CONSENT_VALUE)
}

export function clearCookiePreferences(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem(COOKIE_CONSENT_KEY)
  localStorage.removeItem(COOKIE_PREFERENCES_KEY)
}
