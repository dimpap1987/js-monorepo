'use client'

import { MobileNavbar } from './mobile-navbar'

interface MobileNavbarWithNotificationsProps {
  userId: number | undefined
}

export function MobileNavbarWithNotifications({ userId }: MobileNavbarWithNotificationsProps) {
  if (!userId) return null

  return <MobileNavbar />
}
