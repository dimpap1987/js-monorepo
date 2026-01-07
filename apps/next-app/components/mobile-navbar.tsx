'use client'

import { BottomNavbar, BottomNavbarAlert, BottomNavbarOptions } from '@js-monorepo/bottom-navbar'
import { useDeviceType } from '@js-monorepo/next/hooks'
import { NotificationBellButton } from '@js-monorepo/notifications-ui'
import { AiFillHome } from 'react-icons/ai'

export const MobileNavbar = () => {
  const { deviceType } = useDeviceType()

  if (deviceType !== 'mobile') return null

  return (
    <BottomNavbar>
      <BottomNavbarOptions Icon={AiFillHome} href="/" label="Home" />
      <BottomNavbarAlert href="/notifications" label="Alerts">
        <NotificationBellButton className="shrink-0 text-xl" />
      </BottomNavbarAlert>
    </BottomNavbar>
  )
}
