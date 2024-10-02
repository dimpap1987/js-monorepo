'use server'

import { decodeJwt, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export async function getCurrentSession() {
  try {
    const headers = new Headers()
    cookies()
      .getAll()
      .forEach((cookie) => {
        headers.append('Cookie', `${cookie.name}=${cookie.value}`)
      })

    const response = await fetch(`${process.env.API_URL}/api/auth/session`, {
      method: 'GET',
      headers: headers,
      cache: 'no-store',
    })
    if (response.ok) {
      const session = await response.json()
      return session
    }
  } catch (e) {
    console.log('ERROR in getCurrentSession')
  }
  return null
}

export async function findUnregisteredUser(headers?: Headers) {
  try {
    const response = await fetch(
      `${process.env.API_URL}/api/auth/unregistered-user`,
      {
        method: 'GET',
        headers: headers,
        cache: 'no-store',
      }
    )
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
