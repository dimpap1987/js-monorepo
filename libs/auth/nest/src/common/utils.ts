import { CookieOptions } from 'express'

const sameSite =
  process.env.AUTH_COOKIES_SAME_SITE === ''
    ? undefined
    : (process.env.AUTH_COOKIES_SAME_SITE as boolean | 'lax' | 'strict' | 'none' | undefined)

export const authCookiesOptions: CookieOptions = {
  httpOnly: true,
  domain: process.env.AUTH_COOKIES_DOMAIN,
  sameSite: sameSite,
  secure: process.env.AUTH_COOKIES_SECURE === 'true',
  path: '/',
}

export const toDate = (timestamp?: number): Date | undefined => (timestamp ? new Date(timestamp * 1000) : undefined)

export const capitalize = (s: string) => s && String(s[0]).toUpperCase() + String(s).slice(1)
