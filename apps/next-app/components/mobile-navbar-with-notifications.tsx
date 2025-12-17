'use client'

import { useNotificationAccumulation } from '@next-app/hooks/useNotificationAccumulation'
import { MobileNavbar } from './mobile-navbar'

const initialPage = 1
const initialPageSize = 25

interface MobileNavbarWithNotificationsProps {
  userId: number | undefined
  isLoggedIn: boolean
  isSidebarOpen: boolean
}

export function MobileNavbarWithNotifications({
  userId,
  isLoggedIn,
  isSidebarOpen,
}: MobileNavbarWithNotificationsProps) {
  const { notifications } = useNotificationAccumulation({
    userId,
    initialPage,
    initialPageSize,
  })

  if (!isLoggedIn) {
    return null
  }

  return <MobileNavbar unreadNotificationCount={notifications?.unReadTotal ?? 0} isSidebarOpen={isSidebarOpen} />
}
