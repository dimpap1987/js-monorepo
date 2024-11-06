'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { BottomNavbar, BottomNavbarOptions } from '@js-monorepo/bottom-navbar'
import { AuthRole } from '@js-monorepo/types'
import { HiBellAlert, HiMiniUsers } from 'react-icons/hi2'
import { IconType } from 'react-icons/lib'
import { RiUserSettingsFill } from 'react-icons/ri'

type NavLinkOpts = {
  href: string
  icon: IconType
  label: string
  activeClassName: string
  roles: AuthRole[]
}

export const navLinksOpts: NavLinkOpts[] = [
  {
    href: '/dashboard/users',
    icon: RiUserSettingsFill,
    label: 'Users',
    activeClassName: 'bg-accent text-accent-foreground',
    roles: ['ADMIN'],
  },
  {
    href: '/dashboard/online-users',
    icon: HiMiniUsers,
    label: 'Online',
    activeClassName: 'bg-accent text-accent-foreground',
    roles: ['ADMIN'],
  },
  {
    href: '/dashboard/notifications',
    icon: HiBellAlert,
    label: 'Manage',
    activeClassName: 'bg-accent text-accent-foreground',
    roles: ['ADMIN'],
  },
  // {
  //   href: '/notifications',
  //   icon: IoMdNotifications,
  //   label: 'Alerts',
  //   activeClassName: 'bg-accent text-accent-foreground',
  //   roles: ['USER'],
  // },
] as const

export const MobileNavbar = () => {
  const { isAdmin } = useSession()

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
    </BottomNavbar>
  )
}
