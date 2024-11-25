'use client'

import { DpNextNavLink } from '@js-monorepo/nav-link'
import { cn } from '@js-monorepo/ui/util'
import { DpVersion } from '@js-monorepo/version'
import { PropsWithChildren } from 'react'
import { HiMiniUsers } from 'react-icons/hi2'
import { IoMdNotifications } from 'react-icons/io'
import { RiUserSettingsFill } from 'react-icons/ri'
import { GrAnnounce } from 'react-icons/gr'

const navLinksOpts = [
  {
    href: '/dashboard/users',
    icon: RiUserSettingsFill,
    label: 'Users',
    activeClassName: 'bg-accent text-accent-foreground',
  },
  {
    href: '/dashboard/online-users',
    icon: HiMiniUsers,
    label: 'Online',
    activeClassName: 'bg-accent text-accent-foreground',
  },
  {
    href: '/dashboard/notifications',
    icon: IoMdNotifications,
    label: 'Manage Alerts',
    activeClassName: 'bg-accent text-accent-foreground',
  },
  {
    href: '/dashboard/announcements',
    icon: GrAnnounce,
    label: 'Announcements',
    activeClassName: 'bg-accent text-accent-foreground',
  },
] as const

function Sidebar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'hidden min-w-max sm:flex flex-col justify-between p-2 border-r border-border rounded-md',
        className
      )}
    >
      <div className="space-y-2">
        {navLinksOpts.map(({ href, icon: Icon, label, activeClassName }) => (
          <DpNextNavLink
            key={href}
            className={cn(
              'p-2 transition-colors duration-300 grid place-items-center gap-2 items-center border border-border rounded-md hover:ring-2',
              'grid-cols-[30px_auto]'
            )}
            href={href}
            activeClassName={activeClassName}
          >
            <div className="flex justify-end">
              <Icon className="shrink-0" />
            </div>
            <div className="text-sm">{label}</div>
          </DpNextNavLink>
        ))}
      </div>
      <DpVersion className="text-sm text-center" />
    </div>
  )
}

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <section>
      <Sidebar className="fixed top-[calc(35px_+_var(--navbar-height))] left-0 bottom-0" />
      <div className="absolute p-3 left-0 sm:left-[180px] right-0 overflow-y-hidden max-w-6xl mx-auto">
        {children}
      </div>
    </section>
  )
}
