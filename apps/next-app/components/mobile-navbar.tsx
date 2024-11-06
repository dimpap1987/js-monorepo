'use client'

import { BottomNavbar, BottomNavbarOptions } from '@js-monorepo/bottom-navbar'
import { IoMdNotifications } from 'react-icons/io'

const navLinks = [
  {
    href: '/dashboard/notifications',
    icon: IoMdNotifications,
    label: 'Alerts',
    activeClassName: 'bg-accent text-accent-foreground',
  },
]

export const MobileNavbar = () => {
  return (
    <BottomNavbar className="sm:hidden">
      {navLinks.map(({ href, icon: Icon, label }) => (
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
