'use server'

import { cookies } from 'next/headers'

export async function getCurrentSession() {
  try {
    const headers = new Headers()
    cookies()
      .getAll()
      .forEach((cookie) => {
        headers.append('Cookie', `${cookie.name}=${cookie.value}`)
      })

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/session`,
      {
        method: 'GET',
        headers: headers,
        cache: 'no-store',
      }
    )
    if (response.ok) {
      const session = await response.json()
      return session
    }
  } catch (e) {
    console.log('ERROR in getCurrentSession')
  }
  return null
}

export async function findUnregisteredUser() {
  try {
    const headers = new Headers()
    cookies()
      .getAll()
      .forEach((cookie) => {
        headers.append('Cookie', `${cookie.name}=${cookie.value}`)
      })

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/unregistered-user`,
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
