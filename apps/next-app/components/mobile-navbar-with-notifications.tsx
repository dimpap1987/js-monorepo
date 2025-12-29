'use client'

import { MobileNavbar } from './mobile-navbar'

interface MobileNavbarWithNotificationsProps {
  userId: number | undefined
  isSidebarOpen: boolean
}

export function MobileNavbarWithNotifications({ userId, isSidebarOpen }: MobileNavbarWithNotificationsProps) {
  if (!userId) return null

  return <MobileNavbar isSidebarOpen={isSidebarOpen} />
}
