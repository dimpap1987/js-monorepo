'use client'

import { AnnouncementsComponent } from '@js-monorepo/announcements'
import { authClient, useSession } from '@js-monorepo/auth/next/client'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@js-monorepo/components/ui/sidebar'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { Navbar } from '@js-monorepo/navbar'
import useOfflineIndicator from '@js-monorepo/next/hooks/offline-indicator'
import { DpNextSidebar } from '@js-monorepo/sidebar'
import { MenuItem } from '@js-monorepo/types/menu'
import React, { PropsWithChildren, useMemo } from 'react'
import { useWebSocketConfig } from '../hooks/useWebsocketConfig'
import { AppConfig } from '../lib/app-config'
import { navigationsMenuItems } from '../lib/routes-config'
import { MobileNavbar } from './mobile-navbar'
import { NotificationBellContainerVirtual } from './notification-bell-container-virtual'
import { IoIosSettings } from 'react-icons/io'

function SidebarWrapper({
  children,
  user,
  items,
  plan,
}: PropsWithChildren<{ user?: any; items?: MenuItem[]; plan?: string }>) {
  return (
    <SidebarProvider defaultOpen={false}>
      <DpNextSidebar items={items ?? []} user={user} plan={plan}></DpNextSidebar>
      <SidebarInset asChild>{children}</SidebarInset>
    </SidebarProvider>
  )
}

export default function RootComponent({ children }: PropsWithChildren) {
  const { session, isLoggedIn, isAdmin, refreshSession } = useSession()
  const user = session?.user
  const plan = (session?.subscription as { plan?: string } | undefined)?.plan
  useWebSocketConfig(isLoggedIn, isAdmin, refreshSession)
  useOfflineIndicator()

  return (
    <SidebarWrapper user={user} items={navigationsMenuItems} plan={plan}>
      <section className="flex min-h-screen flex-col">
        {/* Navbar */}
        <Navbar
          menuItems={navigationsMenuItems}
          user={user}
          plan={plan}
          onLogout={() => authClient.logout()}
          logo={
            <DpNextNavLink href="/" className="font-bold text-lg">
              {AppConfig.appName}
            </DpNextNavLink>
          }
          rightActions={user && <NotificationBellContainerVirtual userId={user.id} />}
          sidebarTrigger={<SidebarTrigger />}
          navUserOptionsChildren={useMemo(() => {
            return (
              <DpNextNavLink
                href="/settings"
                className="flex items-center gap-3 justify-start px-4 py-2.5 rounded-xl w-full select-none group transition-all duration-200 hover:bg-secondary"
              >
                <IoIosSettings className="text-xl flex-shrink-0" />
                <span className="text-sm">Settings</span>
              </DpNextNavLink>
            )
          }, [])}
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
