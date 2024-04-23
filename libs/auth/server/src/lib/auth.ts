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

    const response = await fetch(`http://localhost:3333/api/auth/session`, {
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
