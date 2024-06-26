import { DpNextNavLink } from '@js-monorepo/nav-link'
import { DpVersion } from '@js-monorepo/version'
import { PropsWithChildren } from 'react'
import { HiMiniUsers } from 'react-icons/hi2'

export const metadata = {
  title: 'Admin Dashboard',
}

export default async function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <main className="flex flex-grow min-w-[200px] bg-background-primary text-foreground">
      <div className="max-w-max sticky top-0 h-[92.5svh] p-3 flex flex-col border-r border-border">
        <div className="flex-grow">
          <DpNextNavLink
            className="p-2 mt-2 w-full text-center transition-colors duration-300 flex gap-2 items-center justify-center 
            hover:underline border border-border rounded-md min-w-max"
            href={`/dashboard/users`}
            activeClassName="underline"
          >
            <HiMiniUsers className="shrink-0" />
            <span>Manage Users</span>
          </DpNextNavLink>
        </div>
        <DpVersion className="text-sm text-center"></DpVersion>
      </div>
      <div className="flex-1 p-4">{children}</div>
    </main>
  )
}
