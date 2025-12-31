import { ClientResponseType } from '@js-monorepo/types'
import { apiClientBase } from '@js-monorepo/utils/http'

export function buildLoginUrl(callbackUrl?: string): string {
  if (!callbackUrl) {
    return '/auth/login'
  }
  return `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
}

export class AuthClient {
  constructor(private readonly authUrl: string) {
    this.authUrl = authUrl
  }

  async logout(axiosClient = apiClientBase) {
    const response = await axiosClient.get('/auth/logout')
    if (response.status >= 200 && response.status < 300) {
      window.location.replace('/')
    }
  }

  login(provider: 'google' | 'github', callbackUrl?: string) {
    const url = new URL(`${this.authUrl}/api/auth/${provider}/login`)
    if (callbackUrl) {
      url.searchParams.set('callbackUrl', callbackUrl)
    }
    window.location.href = url.toString()
  }

  async registerUser(
    payload: {
      username: string
    },
    axiosClient = apiClientBase
  ): Promise<ClientResponseType<any>> {
    return axiosClient.post('/auth/register', payload)
  }
}

const authClient = new AuthClient(process.env.NEXT_PUBLIC_AUTH_URL ?? '')

export { authClient }

export * from './session'
