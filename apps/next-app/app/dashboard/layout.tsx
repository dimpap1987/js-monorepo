import { BottomNavbarComponent } from '@js-monorepo/bottom-navbar'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { DpVersion } from '@js-monorepo/version'
import { PropsWithChildren } from 'react'
import { HiMiniUsers } from 'react-icons/hi2'
import { RiUserSettingsFill } from 'react-icons/ri'

export const metadata = {
  title: 'Admin Dashboard',
}

// Styles
const desktopNavLinkStyles =
  'p-2 transition-colors duration-300 grid place-items-center grid-cols-[30px_auto] gap-2 items-center border border-primary-border rounded-md hover:ring-2'
const mobileNavLinkStyles =
  'p-2 transition-colors duration-300 grid grid-cols-1 place-items-center gap-2 items-center border border-primary-border rounded-xl hover:ring-2'

//
function MobileView({ children }: PropsWithChildren) {
  return (
    <>
      <div className="px-2 sm:hidden container mx-auto overflow-hidden">
        {children}
      </div>

      <BottomNavbarComponent className="sm:hidden">
        <div className="flex flex-col gap-1 justify-center items-center">
          <DpNextNavLink
            className={mobileNavLinkStyles}
            href={`/dashboard/users`}
            activeClassName="ring-2"
          >
            <div className="flex justify-end">
              <RiUserSettingsFill size="1.3rem" className="shrink-0" />
            </div>
          </DpNextNavLink>
          <div className="text-xs">Edit</div>
        </div>
        <div className="flex flex-col gap-1 justify-center items-center">
          <DpNextNavLink
            className={mobileNavLinkStyles}
            href={`/dashboard/online-users`}
            activeClassName="ring-2"
          >
            <div className="flex justify-end">
              <HiMiniUsers size="1.3rem" className="shrink-0" />
            </div>
          </DpNextNavLink>
          <div className="text-xs">Online</div>
        </div>
      </BottomNavbarComponent>
    </>
  )
}

function DesktopView({ children }: PropsWithChildren) {
  return (
    <section className="sm:grid h-[100%] grid-cols-[max-content_1fr] hidden">
      <div className="min-w-max flex flex-col justify-between p-1 sm:p-2 border-r border-primary-border rounded-md">
        <div className="space-y-2">
          <DpNextNavLink
            className={desktopNavLinkStyles}
            href={`/dashboard/users`}
            activeClassName="bg-accent text-accent-foreground"
          >
            <div className="flex justify-end">
              <RiUserSettingsFill className="shrink-0" />
            </div>
            <div>Manage Users</div>
          </DpNextNavLink>
          <DpNextNavLink
            className={desktopNavLinkStyles}
            href={`/dashboard/online-users`}
            activeClassName="bg-accent text-accent-foreground"
          >
            <div className="flex justify-end">
              <HiMiniUsers className="shrink-0" />
            </div>
            <div>Online Users</div>
          </DpNextNavLink>
        </div>
        <DpVersion className="hidden sm:block text-sm text-center"></DpVersion>
      </div>

      <div className="px-2 container mx-auto overflow-hidden">{children}</div>
    </section>
  )
}

export default async function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <main className="h-[calc(100svh_-_var(--navbar-height)_-_2.5rem)] bg-primary-bg text-foreground">
      <DesktopView>{children}</DesktopView>
      <MobileView>{children}</MobileView>
    </main>
  )
}
