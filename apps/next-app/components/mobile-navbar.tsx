'use client'

import { BottomNavbar, BottomNavbarAlert, BottomNavbarOptions } from '@js-monorepo/bottom-navbar'
import { useDeviceType } from '@js-monorepo/next/hooks'
import { NotificationBellButton } from '@js-monorepo/notifications-ui'
import { AiFillHome } from 'react-icons/ai'

interface MobileNavbarProps {
  unreadNotificationCount: number
  isSidebarOpen?: boolean
}

export const MobileNavbar = ({ unreadNotificationCount, isSidebarOpen = false }: MobileNavbarProps) => {
  const { deviceType } = useDeviceType()

  // Hide bottom navbar on mobile when sidebar is open (standard UX pattern)
  if (deviceType !== 'mobile' || isSidebarOpen) return null

  return (
    <BottomNavbar>
      <BottomNavbarOptions Icon={AiFillHome} href="/" label="Home" />
      <BottomNavbarAlert href="/notifications" label="Alerts">
        <NotificationBellButton unreadNotificationCount={unreadNotificationCount} className="shrink-0 text-xl" />
      </BottomNavbarAlert>
    </BottomNavbar>
  )
}
