'use client'
import { AnnouncementsComponent } from '@js-monorepo/announcements'
import { authClient, useSession } from '@js-monorepo/auth/next/client'
import { DpLoginButton, DpLogoutButton } from '@js-monorepo/button'
import { COOKIE_CATEGORY_IDS, CookieBanner, type CookieCategory } from '@js-monorepo/components/cookie-banner'
import { SidebarInset, SidebarProvider } from '@js-monorepo/components/ui/sidebar'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { DpLogo, DpNextNavbar, NavbarItems } from '@js-monorepo/navbar'
import useOfflineIndicator from '@js-monorepo/next/hooks/offline-indicator'
import useTapEffect from '@js-monorepo/next/hooks/tap-indicator'
import { DpNextSidebar } from '@js-monorepo/sidebar'
import { MenuItem } from '@js-monorepo/types'
import { useWebSocketConfig } from '@next-app/hooks/useWebsocketConfig'
import { useRouter } from 'next-nprogress-bar'
import { PropsWithChildren, useMemo } from 'react'
import { ImPriceTags } from 'react-icons/im'
import { IoIosSettings } from 'react-icons/io'
import { MdOutlineContactMail } from 'react-icons/md'
import { RiAdminFill } from 'react-icons/ri'
import { ImpersonationBanner } from './impersonation-banner'
import SVGLogo from './logo-svg'
import { MobileNavbar } from './mobile-navbar'
import { NotificationBellContainerVirtual } from './notification-bell-container-virtual'

const menuItems: MenuItem[] = [
  {
    href: '/pricing',
    name: 'Pricing',
    Icon: ImPriceTags,
    roles: ['PUBLIC'],
  },
  {
    href: '/contact',
    name: 'Contact',
    Icon: MdOutlineContactMail,
    roles: ['PUBLIC'],
  },
  {
    href: '/settings',
    name: 'Settings',
    roles: ['USER', 'ADMIN'],
    Icon: IoIosSettings,
    className: 'inline-block sm:hidden',
  },
  {
    href: '/dashboard',
    name: 'Dashboard',
    roles: ['ADMIN'],
    Icon: RiAdminFill,
  },
]

const cookieCategories: CookieCategory[] = [
  {
    id: COOKIE_CATEGORY_IDS.METRICS,
    name: 'Metrics & Analytics',
    description:
      'Help us understand how visitors interact with our website by collecting and reporting information anonymously.',
  },
]

export default function MainTemplate({ children }: Readonly<PropsWithChildren>) {
  const { session, isAdmin, refreshSession } = useSession()
  const router = useRouter()
  const user = session?.user
  const plan = (session?.subscription as { plan?: string } | undefined)?.plan
  const isLoggedIn = !!user

  useWebSocketConfig(isLoggedIn, isAdmin, refreshSession)
  useOfflineIndicator()
  useTapEffect()

  // Memoize sidebar children to prevent re-renders
  const sidebarChildren = useMemo(
    () => (
      <div className="p-3">
        {!user && (
          <DpNextNavLink href="/auth/login">
            <DpLoginButton size="large"></DpLoginButton>
          </DpNextNavLink>
        )}
        {!!user && (
          <DpLogoutButton
            className="mb-6 justify-center"
            size="large"
            onClick={() => authClient.logout()}
          ></DpLogoutButton>
        )}
      </div>
    ),
    [user]
  )

  return (
    <SidebarProvider defaultOpen={false}>
      <DpNextSidebar items={menuItems} user={user} plan={plan}>
        {sidebarChildren}
      </DpNextSidebar>

      <SidebarInset className="flex flex-col">
        <ImpersonationBanner />

        <DpNextNavbar user={user} plan={plan} menuItems={menuItems} onLogout={() => authClient.logout()}>
          <DpLogo onClick={() => router.push('/')}>
            <SVGLogo />
          </DpLogo>
          <NavbarItems>{user && <NotificationBellContainerVirtual userId={user.id} />}</NavbarItems>
        </DpNextNavbar>

        <AnnouncementsComponent className="fixed top-[calc(var(--navbar-height)_+_5px)] h-5 z-20" />

        <main className="mt-6 flex-1 px-4 md:px-6">{children}</main>

        {user?.id && <MobileNavbar />}
        <CookieBanner optionalCategories={cookieCategories} />
      </SidebarInset>
    </SidebarProvider>
  )
}
