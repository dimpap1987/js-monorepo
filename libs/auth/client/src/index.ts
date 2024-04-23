import { AuthClient } from './lib/auth-client'

export * from './lib/session'

const authClient = new AuthClient(process.env.NEXT_PUBLIC_AUTH_URL ?? '')

export { authClient }
