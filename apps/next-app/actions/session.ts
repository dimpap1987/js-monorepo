'use server'

import { validateAuthToken } from '@js-monorepo/auth-server'

export async function getCurrentUser() {
  return validateAuthToken(process.env.JWT_SECRET_KEY ?? '')
}
