export const SITE_CONFIG = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'My Super App',
  url: process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://yourdomain.com',
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'A modern web application built with Next.js',
} as const

export const SITE_NAME = SITE_CONFIG.name
export const SITE_URL = SITE_CONFIG.url
export const SITE_DESCRIPTION = SITE_CONFIG.description
