'use server'

import { cookies } from 'next/headers'

export async function submitErrors(error: any) {
  const headers = new Headers()
  headers.append('Content-Type', 'application/json')
  const csrfToken = cookies().get('XSRF-TOKEN')?.value

  if (csrfToken) {
    headers.append('X-XSRF-TOKEN', csrfToken)
  }
  cookies()
    .getAll()
    .forEach((cookie) => {
      headers.append('Cookie', `${cookie.name}=${cookie.value}`)
    })

  const response = await fetch(`${process.env.API_URL}/api/exceptions`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(error),
  })

  if (response.ok) {
    console.log('Error submited')
  } else {
    console.log('Error not submited')
  }
}
