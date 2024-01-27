import { useSession } from 'next-auth/react'

export const useCurrentRoles = () => {
  const session = useSession()

  return session.data?.user?.roles
}
