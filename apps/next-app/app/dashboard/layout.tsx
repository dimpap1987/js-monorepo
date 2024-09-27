import { DpNextNavLink } from '@js-monorepo/nav-link'
import { DpVersion } from '@js-monorepo/version'
import { PropsWithChildren } from 'react'
import { HiMiniUsers } from 'react-icons/hi2'

export const metadata = {
  title: 'Admin Dashboard',
}

export default async function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <main className="h-[87svh] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0 bg-background-primary text-foreground">
      <div
        className="min-w-max col-start-1 col-end-2 row-start-1 row-end-6 border-r border-border
                      flex flex-col justify-between gap-2"
      >
        <div className="space-y-2 text-center">
          <DpNextNavLink
            className="p-2 transition-colors duration-300 grid grid-cols-[20px_auto] sm:grid-cols-[50px_auto] gap-2 items-center 
               hover:underline border border-border rounded-md"
            href={`/dashboard/users`}
            activeClassName="underline"
          >
            <div className="flex justify-end">
              <HiMiniUsers className="shrink-0" />
            </div>
            <span>Manage Users</span>
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
            <span>Online Users</span>
          </DpNextNavLink>
        </div>
        <DpVersion className="text-sm text-center"></DpVersion>
      </div>
      <div className="col-start-2 col-end-6 row-start-1 row-end-6 ml-2">
        {children}
      </div>
    </main>
  )
}
