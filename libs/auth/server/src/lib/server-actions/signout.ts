'use server'

import { AuthClient } from '../auth'

export async function signout() {
  AuthClient.logout()
}
