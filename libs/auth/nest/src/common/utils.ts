import { CookieOptions } from 'express'

export const authCookiesOptions: CookieOptions = {
  httpOnly: true,
  domain: process.env.AUTH_COOKIES_DOMAIN,
  sameSite: 'strict',
  secure: process.env.AUTH_COOKIES_SECURE === 'true',
}
