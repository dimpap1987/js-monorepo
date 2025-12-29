'use client'
import { AnnouncementsComponent } from '@js-monorepo/announcements'
import { authClient, useSession } from '@js-monorepo/auth/next/client'
import { DpLoginButton, DpLogoutButton } from '@js-monorepo/button'
import { CookieBanner, COOKIE_CATEGORY_IDS, type CookieCategory } from '@js-monorepo/components/cookie-banner'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { DpLogo, DpNextNavbar, NavbarItems } from '@js-monorepo/navbar'
import useOfflineIndicator from '@js-monorepo/next/hooks/offline-indicator'
import useTapEffect from '@js-monorepo/next/hooks/tap-indicator'
import { DpNextSidebar } from '@js-monorepo/sidebar'
import { MenuItem } from '@js-monorepo/types'
import { useWebSocketConfig } from '@next-app/hooks/useWebsocketConfig'
import { useRouter } from 'next-nprogress-bar'
import { PropsWithChildren, useCallback, useMemo, useState } from 'react'
import { ImPriceTags } from 'react-icons/im'
import { IoIosSettings } from 'react-icons/io'
import { RiAdminFill } from 'react-icons/ri'
import SVGLogo from './logo-svg'
import { MobileNavbarWithNotifications } from './mobile-navbar-with-notifications'
import { NotificationBellContainerVirtual } from './notification-bell-container-virtual'

const menuItems: MenuItem[] = [
  {
    href: '/pricing',
    name: 'Pricing',
    Icon: ImPriceTags,
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
  const [openSideBar, setOpenSideBar] = useState(false)
  const router = useRouter()
  const user = session?.user
  const isLoggedIn = !!user

  useWebSocketConfig(isLoggedIn, isAdmin, refreshSession)
  useOfflineIndicator()
  useTapEffect()

  // Memoize callbacks to prevent sidebar re-renders
  const handleSidebarClose = useCallback(() => {
    setOpenSideBar(false)
  }, [])

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
    <>
      <DpNextNavbar
        user={user}
        menuItems={menuItems}
        onSideBarClick={() => setOpenSideBar(true)}
        onLogout={() => authClient.logout()}
      >
        <DpLogo onClick={() => router.push('/')}>
          <SVGLogo></SVGLogo>
        </DpLogo>
        <NavbarItems>{user && <NotificationBellContainerVirtual userId={user.id} />}</NavbarItems>
      </DpNextNavbar>

      <AnnouncementsComponent className="fixed top-[calc(var(--navbar-height)_+_5px)] h-5 z-20"></AnnouncementsComponent>

      <DpNextSidebar isOpen={openSideBar} onClose={handleSidebarClose} position="right" items={menuItems} user={user}>
        {sidebarChildren}
      </DpNextSidebar>

      <main className="mt-6">{children}</main>

      {user && <MobileNavbarWithNotifications userId={user.id} isSidebarOpen={openSideBar} />}

      <CookieBanner optionalCategories={cookieCategories} />
    </>
  )
}
