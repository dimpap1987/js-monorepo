import { CookieOptions } from 'express'

const sameSite =
  process.env['AUTH_COOKIES_SAME_SITE'] === ''
    ? undefined
    : (process.env['AUTH_COOKIES_SAME_SITE'] as boolean | 'lax' | 'strict' | 'none' | undefined)

export const authCookiesOptions: CookieOptions = {
  httpOnly: true,
  domain: process.env['AUTH_COOKIES_DOMAIN'],
  sameSite: sameSite,
  secure: process.env['AUTH_COOKIES_SECURE'] === 'true',
}

export const toDate = (timestamp?: number): Date | undefined => (timestamp ? new Date(timestamp * 1000) : undefined)

export const capitalize = (s: string) => s && String(s[0]).toUpperCase() + String(s).slice(1)

interface OAuthState {
  callbackUrl?: string
}

export function encodeOAuthState(data: OAuthState): string {
  return Buffer.from(JSON.stringify(data)).toString('base64')
}

export function decodeOAuthState(state: string): OAuthState | undefined {
  try {
    return JSON.parse(Buffer.from(state, 'base64').toString('utf-8'))
  } catch {
    return undefined
  }
}

/**
 * Normalizes a display name for use as a username.
 * - Lowercase
 * - Remove diacritics/accents
 * - Replace spaces with dots
 * - Remove non-alphanumeric characters (except dots)
 * - Collapse multiple dots, remove leading/trailing dots
 * - Truncate to maxLength (default 12 to leave room for 4-digit suffix)
 * - Ensure minimum 4 characters
 */
export function normalizeDisplayName(displayName: string, maxLength = 12): string {
  if (!displayName || typeof displayName !== 'string') {
    return ''
  }

  let normalized = displayName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/\s+/g, '.') // Spaces to dots
    .replace(/[^a-z0-9.]/g, '') // Remove non-alphanumeric except dots
    .replace(/\.+/g, '.') // Collapse multiple dots
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots

  // Truncate to maxLength
  if (normalized.length > maxLength) {
    normalized = normalized.slice(0, maxLength).replace(/\.+$/, '') // Remove trailing dots after truncate
  }

  return normalized
}

/**
 * Generates a unique username by appending a random 4-digit suffix if needed.
 * @param baseName - The normalized base username
 * @param existsCheck - Function that checks if a username already exists
 * @param maxAttempts - Maximum retry attempts (default 5)
 */
export async function generateUniqueUsername(
  baseName: string,
  existsCheck: (username: string) => Promise<boolean>,
  maxAttempts = 5
): Promise<string> {
  // Ensure baseName meets minimum requirements
  let name = baseName
  if (name.length < 4) {
    // Pad with random alphanumeric characters
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    while (name.length < 4) {
      name += chars.charAt(Math.floor(Math.random() * chars.length))
    }
  }

  // Try the base name first
  const baseExists = await existsCheck(name)
  if (!baseExists) {
    return name
  }

  // Try with random 4-digit suffix
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const suffix = Math.floor(1000 + Math.random() * 9000).toString() // 1000-9999
    const candidate = `${name.slice(0, 12)}${suffix}` // Ensure total <= 16 chars

    const exists = await existsCheck(candidate)
    if (!exists) {
      return candidate
    }
  }

  // Fallback: use UUID-based suffix
  const uuid = crypto.randomUUID().replace(/-/g, '').slice(0, 8)
  return `user${uuid}`.slice(0, 16)
}
