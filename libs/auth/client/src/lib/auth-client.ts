import { ClientResponseType } from '@js-monorepo/types'
import { HttpClientProxy } from '@js-monorepo/utils'

export class AuthClient {
  constructor(
    private readonly publicUrl: string,
    private readonly innerUrl: string
  ) {
    this.publicUrl = publicUrl
    this.innerUrl = innerUrl
  }

  async logout() {
    const response = await HttpClientProxy.builder(
      `${this.innerUrl}/api/auth/logout`
    )
      .get()
      .withCredentials()
      .execute()

    if (response.ok) {
      window.location.reload()
    }
  }

  login(provider: 'google' | 'github') {
    window.location.href = `${this.publicUrl}/api/auth/${provider}/login`
  }

  async registerUser(payload: {
    username: string
  }): Promise<ClientResponseType<any>> {
    const response = await HttpClientProxy.builder(
      `${this.innerUrl}/api/auth/register`
    )
      .body(payload)
      .withCredentials()
      .withCsrf()
      .post()
      .execute()

    return response
  }
}
