import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export class AuthClient {
  private readonly baseUrl: string

  constructor({ baseUrl }: { baseUrl: string }) {
    this.baseUrl = baseUrl
  }

  login(provider: 'google' | 'github') {
    return redirect(`${this.baseUrl}/auth/${provider}/login`)
  }

  static logout() {
    const cookieStore = cookies()
    cookieStore.getAll().forEach((cookie) => {
      cookieStore.delete(cookie.name)
    })
  }

  async getCurrentSession() {
    const cookieStore = cookies()

    const sessionToken = cookieStore.get('accessToken')?.value
    try {
      const response = await fetch(`${this.baseUrl}/auth/session`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `accessToken=${sessionToken};path=/;expires=Session`,
        },
        cache: 'no-store',
      })
      if (response.ok) {
        const session = await response.json()
        return session
      }
    } catch (e) {
      console.log('ERROR in useCurrentUser')
    }
    return null
  }
}
