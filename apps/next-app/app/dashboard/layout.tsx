'use client'

import { DpNextNavLink } from '@js-monorepo/nav-link'
import { AdminTemplateContent, AdminTemplateSideBar } from '@js-monorepo/templates'
import { cn } from '@js-monorepo/ui/util'
import { PropsWithChildren } from 'react'
import { GrAnnounce } from 'react-icons/gr'
import { HiMiniUsers } from 'react-icons/hi2'
import { IoMdNotifications } from 'react-icons/io'
import { RiUserSettingsFill } from 'react-icons/ri'
const navLinksOpts = [
  {
    href: '/dashboard/users',
    icon: RiUserSettingsFill,
    label: 'Users',
    activeClassName: 'bg-primary text-primary-foreground',
  },
  {
    href: '/dashboard/online-users',
    icon: HiMiniUsers,
    label: 'Online',
    activeClassName: 'bg-primary text-primary-foreground',
  },
  {
    href: '/dashboard/notifications',
    icon: IoMdNotifications,
    label: 'Manage Alerts',
    activeClassName: 'bg-primary text-primary-foreground',
  },
  {
    href: '/dashboard/announcements',
    icon: GrAnnounce,
    label: 'Announcements',
    activeClassName: 'bg-primary text-primary-foreground',
  },
] as const

function SidebarOpts() {
  return (
    <div className="space-y-2">
      {navLinksOpts.map(({ href, icon: Icon, label, activeClassName }) => (
        <DpNextNavLink
          key={href}
          className={cn(
            'p-2 transition-colors duration-300 grid place-items-center gap-2 items-center border border-border rounded-md hover:ring-1 ring-primary',
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
  )
}

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <section>
      <AdminTemplateSideBar>
        <SidebarOpts />
      </AdminTemplateSideBar>
      <AdminTemplateContent>{children}</AdminTemplateContent>
    </section>
  )
}
