'use client'
import { AnnouncementsComponent } from '@js-monorepo/announcements'
import { authClient, useSession } from '@js-monorepo/auth/next/client'
import { DpLoginButton, DpLogoutButton } from '@js-monorepo/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { DpLogo, DpNextNavbar, NavbarItems } from '@js-monorepo/navbar'
import { useWebSocket, WebSocketOptionsType } from '@js-monorepo/next/providers'
import { DpNotificationBellComponent } from '@js-monorepo/notification-bell'
import { DpNextSidebar } from '@js-monorepo/sidebar'
import { ModeToggle } from '@js-monorepo/theme-provider'
import { MenuItem } from '@js-monorepo/types'
import { DpVersion } from '@js-monorepo/version'
import { useRouter } from 'next-nprogress-bar'
import { PropsWithChildren, useEffect, useState } from 'react'
import SVGLogo from './logo-svg'

const menuItems: MenuItem[] = [
  {
    href: '/',
    name: 'Home',
    roles: ['PUBLIC'],
  },
  // {
  //   href: '/ai-image-generator',
  //   name: 'AI Image Generator',
  //   roles: ['PUBLIC'],
  // },
  {
    href: '/about',
    name: 'About',
    roles: ['PUBLIC'],
  },
  {
    href: '/feedback',
    name: 'Feedback',
    roles: ['PUBLIC'],
  },
  {
    href: '/dashboard',
    name: 'Dashboard',
    roles: ['ADMIN'],
  },
]

export const websocketOptions: WebSocketOptionsType = {
  url: process.env['NEXT_PUBLIC_WEBSOCKET_PRESENCE_URL'] ?? '',
}

export default function MainTemplate({
  children,
}: Readonly<PropsWithChildren>) {
  const { user, isLoggedIn, isAdmin } = useSession()
  const [openSideBar, setOpenSideBar] = useState(false)
  const socket = useWebSocket(websocketOptions, isLoggedIn)
  const router = useRouter()

  useEffect(() => {
    socket?.on('connect', () => {
      socket.emit('subscribe:announcements', {})
      if (isAdmin) {
        socket?.emit('subscribe:join-admin-room', {})
      }
    })

    return () => {
      socket?.disconnect()
    }
  }, [socket])

  return (
    <>
      <header>
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
              <DpNotificationBellComponent className="hidden sm:block"></DpNotificationBellComponent>
            )}
            <ModeToggle></ModeToggle>
          </NavbarItems>
        </DpNextNavbar>
      </header>

      <AnnouncementsComponent className="p-2"></AnnouncementsComponent>

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
              className="p-3 justify-center text-white"
              size="large"
              onClick={async () => {
                authClient.logout()
              }}
            ></DpLogoutButton>
          )}
        </div>
        <div className="p-2">
          <DpVersion className="text-white"></DpVersion>
        </div>
      </DpNextSidebar>

      {children}
    </>
  )
}
