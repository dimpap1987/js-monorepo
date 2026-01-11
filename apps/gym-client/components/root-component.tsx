'use client'

import { AnnouncementsComponent } from '@js-monorepo/announcements'
import { authClient, useSession } from '@js-monorepo/auth/next/client'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@js-monorepo/components/ui/sidebar'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { Navbar } from '@js-monorepo/navbar'
import useOfflineIndicator from '@js-monorepo/next/hooks/offline-indicator'
import { DpNextSidebar } from '@js-monorepo/sidebar'
import { MenuItem } from '@js-monorepo/types/menu'
import { PropsWithChildren } from 'react'
import { RiAdminFill } from 'react-icons/ri'
import { useWebSocketConfig } from '../hooks/useWebsocketConfig'
import { AppConfig } from '../lib/app-config'
import { MobileNavbar } from './mobile-navbar'
import { NotificationBellContainerVirtual } from './notification-bell-container-virtual'

const menuItems: MenuItem[] = [
  {
    href: '/admin',
    name: 'Dashboard',
    roles: ['ADMIN'],
    Icon: RiAdminFill,
  },
]

function SidebarWrapper({ children, user, items }: PropsWithChildren<{ user?: any; items?: MenuItem[] }>) {
  return (
    <SidebarProvider defaultOpen={false}>
      <DpNextSidebar items={items ?? []} user={user}></DpNextSidebar>
      <SidebarInset asChild>{children}</SidebarInset>
    </SidebarProvider>
  )
}

export default function RootComponent({ children }: PropsWithChildren) {
  const { session, isLoggedIn, isAdmin, refreshSession } = useSession()
  const user = session?.user
  useWebSocketConfig(isLoggedIn, isAdmin, refreshSession)
  useOfflineIndicator()

  return (
    <SidebarWrapper user={user} items={menuItems}>
      <section className="flex min-h-screen flex-col">
        {/* Navbar */}
        <Navbar
          menuItems={menuItems}
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

        {/* Announcements */}
        <AnnouncementsComponent className="fixed top-[calc(var(--navbar-height)_+_5px)] h-5 z-20" />

        {/* Main */}
        <main className="flex-1 mt-6">{children}</main>
        {user?.id && <MobileNavbar />}
      </section>
    </SidebarWrapper>
  )
}
