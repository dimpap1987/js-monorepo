import { useSession } from '@js-monorepo/auth/next/client'
import { useUserNotifications } from '../queries/notifications-queries'

export function useNotificationCount() {
  const {
    session: { user },
  } = useSession()
  const { data } = useUserNotifications(user?.id, '?page=1&pageSize=1')

  return data?.unReadTotal ?? 0
}
