'use client'
import { AnnouncementsComponent } from '@js-monorepo/announcements'
import { authClient, useSession } from '@js-monorepo/auth/next/client'
import { DpLoginButton, DpLogoutButton } from '@js-monorepo/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { DpLogo, DpNextNavbar, NavbarItems } from '@js-monorepo/navbar'
import useOfflineIndicator from '@js-monorepo/next/hooks/offline-indicator'
import useTapEffect from '@js-monorepo/next/hooks/tap-indicator'
import { DpNextSidebar } from '@js-monorepo/sidebar'
import { MenuItem } from '@js-monorepo/types'
import { useWebSocketConfig } from '@next-app/hooks/useWebsocketConfig'
import { useNotificationAccumulation } from '@next-app/hooks/useNotificationAccumulation'
import { useRouter } from 'next-nprogress-bar'
import dynamic from 'next/dynamic'
import { PropsWithChildren, useState } from 'react'
import { ImPriceTags } from 'react-icons/im'
import { IoIosSettings } from 'react-icons/io'
import { RiAdminFill } from 'react-icons/ri'
import SVGLogo from './logo-svg'
import { MobileNavbar } from './mobile-navbar'

const menuItems: MenuItem[] = [
  // {
  //   href: '/ai-image-generator',
  //   name: 'AI Image Generator',
  //   roles: ['PUBLIC'],
  // },
  // {
  //   href: '/about',
  //   name: 'About',
  //   roles: ['PUBLIC'],
  // },
  {
    href: '/pricing',
    name: 'Pricing',
    Icon: ImPriceTags,
    roles: ['PUBLIC'],
  },
  // {
  //   href: '/feedback',
  //   name: 'Feedback',
  //   roles: ['PUBLIC'],
  // },
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

const initialPage = 1
const initialPageSize = 25

const DpNotificationBellComponentDynamic = dynamic(
  () => import('@js-monorepo/notifications-ui').then((module) => module.DpNotificationBellComponent),
  { ssr: false }
)

export default function MainTemplate({ children }: Readonly<PropsWithChildren>) {
  const { session, isLoggedIn, isAdmin, refreshSession } = useSession()
  const [openSideBar, setOpenSideBar] = useState(false)
  const router = useRouter()
  const user = session?.user

  const { accumulatedNotifications, notifications, handlePaginationChange, handleRead, handleReadAll } =
    useNotificationAccumulation({
      userId: user?.id,
      initialPage,
      initialPageSize,
    })

  useWebSocketConfig(isLoggedIn, isAdmin, refreshSession)
  useOfflineIndicator()
  useTapEffect()

  return (
    <>
      <DpNextNavbar
        user={{
          isLoggedIn: isLoggedIn,
          ...user,
        }}
        menuItems={menuItems}
        onSideBarClick={() => {
          setOpenSideBar((prev) => !prev)
        }}
        onLogout={async () => {
          authClient.logout()
        }}
      >
        <DpLogo onClick={() => router.push('/')}>
          <SVGLogo></SVGLogo>
        </DpLogo>
        <NavbarItems>
          {isLoggedIn && (
            <DpNotificationBellComponentDynamic
              className="mt-[0.58rem]"
              pageable={{
                page: notifications?.page ?? initialPage,
                pageSize: notifications?.pageSize ?? initialPageSize,
                totalPages: notifications?.totalPages ?? 0,
              }}
              unreadNotificationCount={notifications?.unReadTotal ?? 0}
              notificationList={accumulatedNotifications}
              onRead={handleRead}
              onReadAll={handleReadAll}
              onPaginationChange={handlePaginationChange}
              resetOnClose={true}
            ></DpNotificationBellComponentDynamic>
          )}
        </NavbarItems>
      </DpNextNavbar>

      <AnnouncementsComponent className="fixed top-[calc(var(--navbar-height)_+_5px)] h-5 z-50"></AnnouncementsComponent>

      <DpNextSidebar
        isOpen={openSideBar}
        onClose={() => setOpenSideBar(false)}
        position="right"
        items={menuItems}
        user={{
          ...user,
        }}
      >
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
              onClick={async () => {
                authClient.logout()
              }}
            ></DpLogoutButton>
          )}
        </div>
      </DpNextSidebar>

      <main className="mt-5">{children}</main>

      {isLoggedIn && (
        <MobileNavbar unreadNotificationCount={notifications?.unReadTotal ?? 0} isSidebarOpen={openSideBar} />
      )}
    </>
  )
}
