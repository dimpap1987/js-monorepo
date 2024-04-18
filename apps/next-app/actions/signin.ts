'use server'

import { auth } from '@next-app/auth'

export async function signin(provider: 'google' | 'github') {
  return auth.login(provider)
}
