'use server'

import { getCurrentSession } from '@js-monorepo/auth/next/server'

export async function getCurrentUser() {
  return getCurrentSession()
}
