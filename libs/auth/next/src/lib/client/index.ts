import { ClientResponseType } from '@js-monorepo/types'
import { HttpClientBuilder, HttpClientProxy } from '@js-monorepo/utils/http'

export class AuthClient {
  constructor(private readonly authUrl: string) {
    this.authUrl = authUrl
  }

  async logout(
    fetchBuilder: HttpClientBuilder = new HttpClientProxy().builder()
  ) {
    const response = await fetchBuilder
      .url(`${this.authUrl}/api/auth/logout`)
      .get()
      .withCredentials()
      .execute()

    if (response.ok) {
      window.location.reload()
    }
  }

  login(provider: 'google' | 'github') {
    window.location.href = `${this.authUrl}/api/auth/${provider}/login`
  }

  async registerUser(
    payload: {
      username: string
    },
    fetchBuilder: HttpClientBuilder = new HttpClientProxy().builder()
  ): Promise<ClientResponseType<any>> {
    const response = await fetchBuilder
      .url(`${this.authUrl}/api/auth/register`)
      .body(payload)
      .withCredentials()
      .withCsrf()
      .post()
      .execute()

    return response
  }
}

const authClient = new AuthClient(process.env.NEXT_PUBLIC_AUTH_URL ?? '')

export { authClient }

export * from './session'
