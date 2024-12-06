import { ClientResponseType } from '@js-monorepo/types'
import axios from 'axios'

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_AUTH_URL}/api`,
  timeout: 5000,
  withCredentials: true,
})

export class AuthClient {
  constructor(private readonly authUrl: string) {
    this.authUrl = authUrl
  }

  async logout(axiosClient = apiClient) {
    const response = await axiosClient.get('/auth/logout')
    if (response.status >= 200 && response.status < 300) {
      window.location.replace('/')
    }
  }

  login(provider: 'google' | 'github') {
    window.location.href = `${this.authUrl}/api/auth/${provider}/login`
  }

  async registerUser(
    payload: {
      username: string
    },
    axiosClient = apiClient
  ): Promise<ClientResponseType<any>> {
    return axiosClient.post('/auth/register', payload)
  }
}

const authClient = new AuthClient(process.env.NEXT_PUBLIC_AUTH_URL ?? '')

export { authClient }

export * from './session'
