'use server'

import { signOut } from '../auth'

export const logout = async (
  options?: typeof signOut extends (...args: infer Params) => Promise<unknown>
    ? Params[0]
    : undefined
) => {
  await signOut({
    ...options,
  })
}
