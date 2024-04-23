import { ClientResponseType } from '@js-monorepo/types'

export * from './lib/session'

export async function logout() {
  try {
    const response = await fetch(`http://localhost:3333/api/auth/logout`, {
      method: 'GET',
      credentials: 'include',
    })
    if (response.ok) {
      window.location.reload()
    } else {
      console.error('Logout failed')
    }
  } catch (error) {
    console.error('Error during logout:', error)
  }
}

export function login(provider: 'google' | 'github') {
  window.location.href = `http://localhost:3333/api/auth/${provider}/login`
}

export async function registerUser(payload: {
  username: string
}): Promise<ClientResponseType> {
  try {
    const response = await fetch('http://localhost:3333/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    })

    const responseData = await response.json()
    if (!response.ok) {
      return {
        ok: false,
        message: responseData.message,
        errors: responseData.errors,
      }
    } else {
      return {
        ok: true,
        data: responseData,
      }
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      ok: false,
      message: 'Something went wrong, try again later...',
    }
  }
}
