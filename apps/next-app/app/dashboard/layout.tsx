import { DpNextNavLink } from '@js-monorepo/nav-link'
import { DpVersion } from '@js-monorepo/version'
import { PropsWithChildren } from 'react'
import { HiMiniUsers } from 'react-icons/hi2'
import { IoMdNotifications } from 'react-icons/io'
import { RiUserSettingsFill } from 'react-icons/ri'

export const metadata = {
  title: 'Admin Dashboard',
}

export const navLinksOpts = [
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

function MobileView({ children }: PropsWithChildren) {
  return (
    <div className="px-2 sm:hidden container overflow-hidden">{children}</div>
  )
}

function DesktopView({ children }: PropsWithChildren) {
  return (
    <section className="sm:grid h-[100%] grid-cols-[max-content_1fr] hidden">
      <div className="min-w-max flex flex-col justify-between p-1 sm:p-2 border-r border-border rounded-md">
        <div className="space-y-2">
          {navLinksOpts.map(({ href, icon: Icon, label, activeClassName }) => (
            <DpNextNavLink
              key={href}
              className="p-2 transition-colors duration-300 grid place-items-center grid-cols-[30px_auto] gap-2 items-center border border-border rounded-md hover:ring-2"
              href={href}
              activeClassName={activeClassName}
            >
              <div className="flex justify-end">
                <Icon className="shrink-0" />
              </div>
              <div>{label}</div>
            </DpNextNavLink>
          ))}
        </div>
        <DpVersion className="hidden sm:block text-sm text-center"></DpVersion>
      </div>

      <div className="px-2 container overflow-hidden">{children}</div>
    </section>
  )
}

export default async function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <main className="h-[calc(100svh_-_var(--navbar-height)_-_2.5rem)] bg-background text-foreground">
      <DesktopView>{children}</DesktopView>
      <MobileView>{children}</MobileView>
    </main>
  )
}
