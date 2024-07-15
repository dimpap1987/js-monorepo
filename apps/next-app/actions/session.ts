'use server'

import { decodeAuthToken } from '@js-monorepo/auth-server'

export async function getCurrentUser() {
  return decodeAuthToken()
}
