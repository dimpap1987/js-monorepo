'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { NotificationPage as NotificationPageComponent } from '@js-monorepo/notifications-ui'

export function NotificationPage() {
  const { session } = useSession()
  const user = session?.user

  if (!user.id) return
  return <NotificationPageComponent userId={user.id} />
}
