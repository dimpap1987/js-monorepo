'use server'

import { cookies } from 'next/headers'

const isDev = process.env.NODE_ENV === 'development'

const APP_URL = isDev ? process.env.DEV_BACKEND_URL : process.env.APP_URL

if (!APP_URL) {
  console.warn('[auth/next/server] APP_URL environment variable is not set')
}

function createCookieHeaders(): Headers {
  const headers = new Headers()
  const cookieStore = cookies()

  cookieStore.getAll().forEach((cookie) => {
    headers.append('Cookie', `${cookie.name}=${cookie.value}`)
  })

  return headers
}

export async function getCurrentSession() {
  if (!APP_URL) {
    console.error('[getCurrentSession] APP_URL is not configured')
    return null
  }

  try {
    const headers = createCookieHeaders()
    const url = `${APP_URL}/api/session`

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store', // Ensure fresh session data
    })

    if (response.ok) {
      const session = await response.json()
      return session
    }

    // Only log non-401/403 errors (authentication errors are expected)
    if (response.status !== 401 && response.status !== 403) {
      console.warn('[getCurrentSession] Non-OK response', {
        status: response.status,
        statusText: response.statusText,
        url,
      })
    }
  } catch (error) {
    // Don't log during Next.js static generation (expected behavior for dynamic routes)
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (!errorMessage.includes('Dynamic server usage')) {
      console.error('[getCurrentSession] Fetch failed', {
        url: `${APP_URL}/api/session`,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      })
    }
  }

  return null
}

/**
 * Finds an unregistered user by checking cookies
 * @param headers Optional headers to use (if not provided, creates from cookies)
 * @returns Unregistered user object or null if not found or error occurred
 */
export async function findUnregisteredUser(headers?: Headers) {
  if (!APP_URL) {
    console.error('[findUnregisteredUser] APP_URL is not configured')
    return null
  }

  try {
    const requestHeaders = headers ?? createCookieHeaders()
    const url = `${APP_URL}/api/auth/unregistered-user`

    const response = await fetch(url, {
      method: 'GET',
      headers: requestHeaders,
      cache: 'no-store',
    })

    if (response.ok) {
      const unRegisteredUser = await response.json()
      return unRegisteredUser
    }

    if (response.status !== 404) {
      console.warn('[findUnregisteredUser] Non-OK response', {
        status: response.status,
        statusText: response.statusText,
        url,
      })
    }
  } catch (error) {
    // Don't log during Next.js static generation (expected behavior for dynamic routes)
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (!errorMessage.includes('Dynamic server usage')) {
      console.error('[findUnregisteredUser] Fetch failed', {
        url: `${APP_URL}/api/auth/unregistered-user`,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      })
    }
  }

  return null
}
