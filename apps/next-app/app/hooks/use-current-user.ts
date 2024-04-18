'use server'
import { auth } from '@next-app/auth'

export const getCurrentSession = async () => {
  return auth.getCurrentSession()
}
