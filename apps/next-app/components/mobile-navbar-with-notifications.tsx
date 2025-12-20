'use client'

import { useNotificationAccumulation } from '@next-app/hooks/useNotificationAccumulation'
import { MobileNavbar } from './mobile-navbar'

const initialPage = 1
const initialPageSize = 25

interface MobileNavbarWithNotificationsProps {
  userId: number | undefined
  isSidebarOpen: boolean
}

export function MobileNavbarWithNotifications({ userId, isSidebarOpen }: MobileNavbarWithNotificationsProps) {
  const { notifications } = useNotificationAccumulation({
    userId,
    initialPage,
    initialPageSize,
  })

  if (!userId) return null

  return <MobileNavbar unreadNotificationCount={notifications?.unReadTotal ?? 0} isSidebarOpen={isSidebarOpen} />
}
