import { DpNextNavLink } from '@js-monorepo/nav-link'
import { DpVersion } from '@js-monorepo/version'
import { PropsWithChildren } from 'react'
import { HiMiniUsers } from 'react-icons/hi2'
import { RiUserSettingsFill } from 'react-icons/ri'

export const metadata = {
  title: 'Admin Dashboard',
}

export default async function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <main
      className="grid grid-cols-[max-content_1fr] gap-2
                 h-[87svh] bg-background-primary text-foreground"
    >
      <div
        className="min-w-max flex flex-col justify-between gap-2 
                  p-2 border-t border-r border-border rounded-md"
      >
        <div className="space-y-2">
          <DpNextNavLink
            className="p-2 transition-colors duration-300 grid grid-cols-1 place-items-center
                       sm:grid-cols-[50px_auto] gap-2 items-center 
                       border border-border rounded-md hover:ring-2"
            href={`/dashboard/users`}
            activeClassName="bg-accent"
          >
            <div className="flex justify-end">
              <RiUserSettingsFill className="shrink-0" />
            </div>
            <div className="hidden sm:block">Manage Users</div>
          </DpNextNavLink>
          <DpNextNavLink
            className="p-2 transition-colors duration-300 grid grid-cols-1 place-items-center
                       sm:grid-cols-[50px_auto] gap-2 items-center 
                       border border-border rounded-md hover:ring-2"
            href={`/dashboard/online-users`}
            activeClassName="bg-accent"
          >
            <div className="flex justify-end">
              <HiMiniUsers className="shrink-0" />
            </div>
            <div className="hidden sm:block">Online Users</div>
          </DpNextNavLink>
        </div>
        <DpVersion className="hidden sm:block text-sm text-center"></DpVersion>
      </div>
      <div className="px-3 overflow-hidden">{children}</div>
    </main>
  )
}
