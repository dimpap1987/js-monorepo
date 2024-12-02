'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import {
  BottomNavbar,
  BottomNavbarAlert,
  BottomNavbarOptions,
} from '@js-monorepo/bottom-navbar'
import { useDeviceType } from '@js-monorepo/next/hooks'
import {
  NotificationBellButton,
  useNotificationStore,
} from '@js-monorepo/notifications-client'
import { AuthRole } from '@js-monorepo/types'
import { AiFillHome } from 'react-icons/ai'
import { IconType } from 'react-icons/lib'

type NavLinkOpts = {
  href: string
  icon: IconType
  label: string
  activeClassName: string
  roles: AuthRole[]
}

export const navLinksOpts: NavLinkOpts[] = [
  {
    href: '/',
    icon: AiFillHome,
    label: 'Home',
    activeClassName: 'bg-accent text-accent-foreground',
    roles: ['USER', 'ADMIN'],
  },
] as const

export const MobileNavbar = () => {
  const { isAdmin } = useSession()
  const { notificationCount } = useNotificationStore()
  const { deviceType } = useDeviceType()

  if (deviceType !== 'mobile') return null

  return (
    <BottomNavbar className="sm:hidden">
      {navLinksOpts
        .filter(
          ({ roles }) =>
            (roles.includes('ADMIN') && isAdmin) || roles.includes('USER')
        )
        .map(({ href, icon: Icon, label }) => (
          <BottomNavbarOptions
            Icon={Icon}
            href={href}
            label={label}
            key={href}
          ></BottomNavbarOptions>
        ))}
      <BottomNavbarAlert href="/notifications" label="Alerts">
        <NotificationBellButton unreadNotificationCount={notificationCount} />
      </BottomNavbarAlert>
    </BottomNavbar>
  )
}
