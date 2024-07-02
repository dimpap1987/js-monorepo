import { ClientResponseType } from '@js-monorepo/types'

export class AuthClient {
  private readonly BASE_URL: string

  constructor(private readonly baseUrl: string) {
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

      if (response.ok) {
        return {
          ok: true,
        }
      }

      const errorData = await response.json()
      return {
        ok: false,
        message: errorData.message,
        errors: errorData.errors,
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
