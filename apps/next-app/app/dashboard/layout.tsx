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
      className="h-[87svh] min-w-[250px] grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 
                 gap-2 bg-background-primary text-foreground"
    >
      <div
        className="min-w-max col-span-1 sm:col-span-2 lg:col-span-2 border-r border-border
                      flex flex-col justify-between gap-2"
      >
        <div className="space-y-2">
          <DpNextNavLink
            className="p-2 transition-colors duration-300 grid grid-cols-[20px_auto] sm:grid-cols-[50px_auto] gap-2 items-center 
               hover:underline border border-border rounded-md"
            href={`/dashboard/users`}
            activeClassName="underline"
          >
            <div className="flex justify-end">
              <RiUserSettingsFill className="shrink-0" />
            </div>
            <div className="pl-3 hidden sm:block">Manage Users</div>
          </DpNextNavLink>
          <DpNextNavLink
            className="p-2 transition-colors duration-300 grid grid-cols-[20px_auto] sm:grid-cols-[50px_auto] gap-2 items-center 
               hover:underline border border-border rounded-md"
            href={`/dashboard/online-users`}
            activeClassName="underline"
          >
            <div className="flex justify-end">
              <HiMiniUsers className="shrink-0" />
            </div>
            <div className="pl-3 hidden sm:block">Online Users</div>
          </DpNextNavLink>
        </div>
        <DpVersion className="hidden sm:block text-sm text-center"></DpVersion>
      </div>
      <div className="col-span-3 sm:col-span-3 lg:col-span-4">{children}</div>
    </main>
  )
}
