'use client'

import { authClient, useSession } from '@js-monorepo/auth/next/client'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@js-monorepo/components/ui/sidebar'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { Navbar } from '@js-monorepo/navbar'
import { DpNextSidebar } from '@js-monorepo/sidebar'
import { PropsWithChildren } from 'react'
import { AppConfig } from '../lib/app-config'
import { NotificationBellContainerVirtual } from './notification-bell-container-virtual'
import { MobileNavbar } from './mobile-navbar'

function SidebarWrapper({ children, user }: PropsWithChildren<{ user?: any }>) {
  return (
    <SidebarProvider defaultOpen={false}>
      <DpNextSidebar items={[]} user={user}></DpNextSidebar>
      <SidebarInset asChild>{children}</SidebarInset>
    </SidebarProvider>
  )
}

export default function RootComponent({ children }: PropsWithChildren) {
  const { session } = useSession()
  const user = session?.user
  return (
    <SidebarWrapper user={user}>
      <section className="flex min-h-screen flex-col">
        {/* Navbar */}
        <Navbar
          user={user}
          onLogout={() => authClient.logout()}
          logo={
            <DpNextNavLink href="/" className="font-bold text-lg">
              {AppConfig.appName}
            </DpNextNavLink>
          }
          rightActions={user && <NotificationBellContainerVirtual userId={user.id} />}
          sidebarTrigger={<SidebarTrigger />}
        ></Navbar>

        {/* Main */}
        <main className="flex-1">{children}</main>
        {user?.id && <MobileNavbar />}
      </section>
    </SidebarWrapper>
  )
}
