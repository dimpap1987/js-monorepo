'use client'

import { AnnouncementsComponent } from '@js-monorepo/announcements'
import { authClient, useSession } from '@js-monorepo/auth/next/client'
import { DpLoginButton, DpLogoutButton } from '@js-monorepo/button'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@js-monorepo/components/ui/sidebar'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { Navbar } from '@js-monorepo/navbar'
import useOfflineIndicator from '@js-monorepo/next/hooks/offline-indicator'
import { DpNextSidebar } from '@js-monorepo/sidebar'
import { MenuItem } from '@js-monorepo/types/menu'
import { useTranslations } from 'next-intl'
import { PropsWithChildren, ReactNode, useMemo } from 'react'
import { IoIosSettings } from 'react-icons/io'
import { useWebSocketConfig } from '../hooks/useWebsocketConfig'
import { AppConfig } from '../lib/app-config'
import { navigationsMenuItems } from '../lib/routes-config'
import { ImpersonationBanner } from './impersonation-banner'
import { MobileNavbar } from './mobile-navbar'
import { NotificationBellContainerVirtual } from './notification-bell-container-virtual'

function SidebarWrapper({
  children,
  user,
  items,
  plan,
  sidebarChildren,
}: PropsWithChildren<{ user?: any; items?: MenuItem[]; plan?: string; sidebarChildren?: ReactNode }>) {
  return (
    <SidebarProvider defaultOpen={false}>
      <DpNextSidebar items={items ?? []} user={user} plan={plan}>
        {sidebarChildren}
      </DpNextSidebar>
      <SidebarInset asChild>{children}</SidebarInset>
    </SidebarProvider>
  )
}

export default function RootComponent({ children }: PropsWithChildren) {
  const { session, isLoggedIn, isAdmin, refreshSession } = useSession()
  const t = useTranslations()
  const user = session?.user
  const plan = (session?.subscription as { plan?: string } | undefined)?.plan
  useWebSocketConfig(isLoggedIn, isAdmin, refreshSession)
  useOfflineIndicator()

  // 1. Filter and translate the main navigation items for Navbar and Sidebar
  const translatedMenuItems = useMemo(() => {
    const hasOrganizerProfile = session?.appUser?.hasOrganizerProfile
    const hasParticipantProfile = session?.appUser?.hasParticipantProfile

    return navigationsMenuItems
      .filter((item) => {
        // Filter by organizer requirement
        if (item.requiresOrganizer && !hasOrganizerProfile) return false
        // Filter by participant requirement
        if (item.requiresParticipant && !hasParticipantProfile) return false
        return true
      })
      .map((item) => ({
        ...item,
        name: t(item.name as any),
        // Translate children items if they exist
        children: item.children?.map((child) => ({
          ...child,
          name: t(child.name as any),
        })),
      }))
  }, [t, session?.appUser?.hasOrganizerProfile, session?.appUser?.hasParticipantProfile])

  const settingsNavLink = (
    <DpNextNavLink
      href="/settings"
      className="flex items-center gap-3 justify-start px-4 py-2.5 rounded-xl w-full select-none group transition-all duration-200 hover:bg-secondary"
    >
      <IoIosSettings className="text-xl flex-shrink-0" />
      <span className="text-sm">{t('navigation.settings' as any)}</span>
    </DpNextNavLink>
  )

  const loginLogoutButton = user ? (
    <DpLogoutButton onClick={() => authClient.logout()} className="px-4" />
  ) : (
    <DpNextNavLink href="/auth/login">
      <DpLoginButton />
    </DpNextNavLink>
  )

  return (
    <SidebarWrapper user={user} items={translatedMenuItems} plan={plan} sidebarChildren={loginLogoutButton}>
      <section className="flex min-h-screen flex-col">
        {/* Navbar */}
        <Navbar
          menuItems={translatedMenuItems} // Pass translated list
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
          navUserOptionsChildren={settingsNavLink}
        ></Navbar>
        {/* Announcements */}
        <AnnouncementsComponent className="fixed top-[calc(var(--navbar-height)_+_5px)] h-5 z-20" />
        {/* Main */}
        <main className="flex-1 mt-6">{children}</main>
        <ImpersonationBanner />
        {user?.id && <MobileNavbar />}
      </section>
    </SidebarWrapper>
  )
}
