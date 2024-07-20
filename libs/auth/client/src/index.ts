import { AuthClient } from './lib/auth-client'

export * from './lib/session'

const authClient = new AuthClient(
  process.env.NEXT_PUBLIC_AUTH_URL_PUBLIC ?? '',
  process.env.NEXT_PUBLIC_AUTH_URL_INNER ?? ''
)

export { authClient }
