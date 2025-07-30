'use server'

import { decodeJwt, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

function getHeaders() {
  const headers = new Headers()
  cookies()
    .getAll()
    .forEach((cookie) => {
      headers.append('Cookie', `${cookie.name}=${cookie.value}`)
    })

  return headers
}

export async function getCurrentSession() {
  const apiUrl = process.env.API_URL ?? 'undefined'

  try {
    const response = await fetch(`${apiUrl}/api/session`, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (response.ok) {
      const session = await response.json()
      return session
    } else {
      console.warn('[getCurrentSession] Non-OK response', {
        status: response.status,
        statusText: response.statusText,
        url: `${apiUrl}/api/session`,
      })
    }
  } catch (error) {
    console.error('[getCurrentSession] Fetch failed', {
      url: `${apiUrl}/api/session`,
      error: error instanceof Error ? error.message : String(error),
    })
  }

  return null
}

export async function findUnregisteredUser() {
  try {
    const response = await fetch(`${process.env.API_URL}/api/auth/unregistered-user`, {
      method: 'GET',
      headers: getHeaders(),
    })
    if (response.ok) {
      const unRegisteredUser = await response.json()
      return unRegisteredUser
    }
  } catch (e) {
    console.error('Error in findUnregisteredUser', e)
    return null
  }
}

export async function validateAuthToken(secret: string): Promise<any> {
  const token = cookies().get('accessToken')?.value
  if (!token || token === '') return null
  try {
    return (await jwtVerify(token, new TextEncoder().encode(secret))).payload
  } catch (e) {
    return null
  }
}

export async function decodeAuthToken(): Promise<any> {
  try {
    const accessToken = cookies().get('accessToken')?.value
    if (!accessToken || accessToken === '') return null

    const payload = decodeJwt(accessToken)

    if (!payload) return null

    return payload
  } catch (e) {
    return null
  }
}
