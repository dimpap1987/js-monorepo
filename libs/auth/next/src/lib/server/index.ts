'use server'

import { cookies } from 'next/headers'

const API_URL = process.env.INTERNAL_API_URL

if (!API_URL) {
  console.warn('[auth/next/server] API_URL environment variable is not set')
}

export async function createCookieHeaders(): Promise<Headers> {
  const headers = new Headers()
  const cookieStore = cookies()

  cookieStore.getAll().forEach((cookie) => {
    headers.append('Cookie', `${cookie.name}=${cookie.value}`)
  })

  if (process.env.APP_URL) {
    headers.set('Origin', process.env.APP_URL)
    headers.set('Referer', `${process.env.APP_URL}/`)
  }
  return headers
}

export async function getCurrentSession() {
  if (!API_URL) {
    console.error('[getCurrentSession] API_URL is not configured')
    return null
  }

  try {
    const headers = await createCookieHeaders()
    const url = `${API_URL}/api/session`
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
        url: `${API_URL}/api/session`,
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
  if (!API_URL) {
    console.error('[findUnregisteredUser] API_URL is not configured')
    return null
  }

  try {
    const requestHeaders = headers ?? (await createCookieHeaders())
    const url = `${API_URL}/api/auth/unregistered-user`

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
        url: `${API_URL}/api/auth/unregistered-user`,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      })
    }
  }

  return null
}
