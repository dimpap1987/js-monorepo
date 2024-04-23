import { ClientResponseType } from '@js-monorepo/types'

export class AuthClient {
  private readonly BASE_URL: string

  constructor(private baseUrl: string) {
    this.BASE_URL = baseUrl
  }

  async logout() {
    try {
      const response = await fetch(`${this.BASE_URL}/api/auth/logout`, {
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

  login(provider: 'google' | 'github') {
    window.location.href = `${this.BASE_URL}/api/auth/${provider}/login`
  }

  async registerUser(payload: {
    username: string
  }): Promise<ClientResponseType> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/auth/register`, {
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
}
