import { AuthClient } from '@js-monorepo/auth-server'

const auth = new AuthClient({
  baseUrl: 'http://localhost:3333/api',
})

export { auth }
