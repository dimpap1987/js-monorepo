'use server'

import { decodeAuthToken } from '@js-monorepo/auth/next/server'

export async function getCurrentUser() {
  return decodeAuthToken()
}
