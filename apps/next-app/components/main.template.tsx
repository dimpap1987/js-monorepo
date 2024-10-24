'use client'
import { AnnouncementsComponent } from '@js-monorepo/announcements'
import { authClient, useSession } from '@js-monorepo/auth/next/client'
import { DpLoginButton, DpLogoutButton } from '@js-monorepo/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { DpLogo, DpNextNavbar, NavbarItems } from '@js-monorepo/navbar'
import { useWebSocket, WebSocketOptionsType } from '@js-monorepo/next/providers'
import { DpNextSidebar } from '@js-monorepo/sidebar'
import { ModeToggle } from '@js-monorepo/theme-provider'
import { MenuItem, PaginationType } from '@js-monorepo/types'
import { DpVersion } from '@js-monorepo/version'
import { API } from '@next-app/api-proxy'
import { useRouter } from 'next-nprogress-bar'
import dynamic from 'next/dynamic'
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

async function fetchUserNotifications(
  userId: number,
  pagination = { page: 1, pageSize: 15 }
) {
  return API.url(
    `${process.env.NEXT_PUBLIC_AUTH_URL}/api/notifications/users/${userId}?page=${pagination.page}&pageSize=${pagination.pageSize}`
  )
    .get()
    .withCredentials()
    .execute()
}

async function readNotification(notificationId: number) {
  return API.url(
    `${process.env.NEXT_PUBLIC_AUTH_URL}/api/notifications/${notificationId}/read`
  )
    .patch()
    .withCredentials()
    .execute()
}

const DpNotificationBellComponentDynamic = dynamic(
  () =>
    import('@js-monorepo/notification-bell').then(
      (module) => module.DpNotificationBellComponent
    ),
  { ssr: false }
)

export default function MainTemplate({
  children,
}: Readonly<PropsWithChildren>) {
  const { user, isLoggedIn, isAdmin, refreshSession } = useSession()
  const [openSideBar, setOpenSideBar] = useState(false)
  const { socket, disconnect } = useWebSocket(websocketOptions, isLoggedIn)
  const router = useRouter()
  const [notifications, setNotifications] = useState<
    PaginationType | undefined
  >()

  useEffect(() => {
    if (!user?.id) return
    fetchUserNotifications(user.id).then((response) => {
      if (response.ok) {
        setNotifications(response.data as PaginationType)
      }
    })
  }, [user])

  useEffect(() => {
    if (!socket) return

    socket.on('connect', () => {
      socket.emit('subscribe:announcements', {})
      socket.on('events:refresh-session', () => {
        setTimeout(() => {
          refreshSession()
        }, 1000)
      })
    })

    return () => {
      disconnect()
    }
  }, [socket])

  useEffect(() => {
    if (socket && isAdmin) {
      socket.emit('subscribe:join-admin-room', {})
    }
  }, [socket, isAdmin])

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
              <DpNotificationBellComponentDynamic
                pagebale={notifications}
                onRead={(id) => {
                  return readNotification(id)
                }}
                onPaginationChange={async (pagination) => {
                  return fetchUserNotifications(user!.id, pagination).then(
                    (response) => {
                      if (response.ok) {
                        setNotifications(response.data as PaginationType)
                      }
                    }
                  )
                }}
              ></DpNotificationBellComponentDynamic>
            )}
            <ModeToggle className="hidden sm:inline-block"></ModeToggle>
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
              className="p-3 justify-center"
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
