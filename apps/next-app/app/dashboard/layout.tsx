'use client'

import { DpNextNavLink } from '@js-monorepo/nav-link'
import { cn } from '@js-monorepo/ui/util'
import { DpVersion } from '@js-monorepo/version'
import { PropsWithChildren } from 'react'
import { HiMiniUsers } from 'react-icons/hi2'
import { IoMdNotifications } from 'react-icons/io'
import { RiUserSettingsFill } from 'react-icons/ri'

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
] as const

function Sidebar() {
  return (
    <div className="hidden min-w-max sm:flex flex-col justify-between p-2 border-r border-border rounded-md">
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
    <section className="h-[calc(100svh_-_var(--navbar-height)_-_2.9rem)] bg-background text-foreground">
      <div
        className={cn(
          'h-full',
          'grid grid-rows-[auto_1fr]', // Mobile: stacked layout
          'sm:grid-rows-1 sm:grid-cols-[max-content_1fr]' // Desktop: side-by-side layout
        )}
      >
        <Sidebar />
        <div className="px-2 container overflow-hidden">{children}</div>
      </div>
    </section>
  )
}
