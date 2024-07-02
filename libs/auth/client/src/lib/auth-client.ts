import { ClientResponseType } from '@js-monorepo/types'
import { HttpClientProxy } from '@js-monorepo/utils'

export class AuthClient {
  private readonly BASE_URL: string

  constructor(private readonly baseUrl: string) {
    this.BASE_URL = baseUrl
  }

  async logout() {
    const response = await HttpClientProxy.builder(
      `${this.BASE_URL}/api/auth/logout`
    )
      .get()
      .withCredentials()
      .execute()

    if (response.ok) {
      window.location.reload()
    }
  }

  login(provider: 'google' | 'github') {
    window.location.href = `${this.BASE_URL}/api/auth/${provider}/login`
  }

  async registerUser(payload: {
    username: string
  }): Promise<ClientResponseType<any>> {
    const response = await HttpClientProxy.builder(
      `${this.BASE_URL}/api/auth/register`
    )
      .body(payload)
      .withCredentials()
      .post()
      .execute()

    return response
  }
}
