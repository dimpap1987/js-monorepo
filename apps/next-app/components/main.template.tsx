'use client'
import { AnnouncementsComponent } from '@js-monorepo/announcements'
import { authClient, useSession } from '@js-monorepo/auth/next/client'
import { DpLoginButton, DpLogoutButton } from '@js-monorepo/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { DpLogo, DpNextNavbar, NavbarItems } from '@js-monorepo/navbar'
import { useNotificationWebSocket } from '@js-monorepo/notification-bell'
import { DpNextSidebar } from '@js-monorepo/sidebar'
import { ModeToggle } from '@js-monorepo/theme-provider'
import {
  MenuItem,
  PaginationType,
  UserNotificationType,
} from '@js-monorepo/types'
import { DpVersion } from '@js-monorepo/version'
import { useWebPushNotification } from '@js-monorepo/web-notification'
import { useWebSocketConfig } from '@next-app/hooks/useWebsocketConfig'
import { useNotificationStore } from '@next-app/state'
import {
  apiFetchUserNotifications,
  apiReadNotification,
} from '@next-app/utils/notifications'
import { websocketOptions } from '@next-app/utils/websocket.config'
import { useRouter } from 'next-nprogress-bar'
import dynamic from 'next/dynamic'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import SVGLogo from './logo-svg'
import { MobileNavbar } from './mobile-navbar'

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
  const fetchNotificationsRef = useRef(false)
  const router = useRouter()
  const [notifications, setNotifications] = useState<
    Partial<PaginationType> | undefined
  >()

  const { permission, createNotification } = useWebPushNotification()
  const {
    notificationCount,
    markNotificationAsRead,
    latestReadNotificationId,
    setNotificationCount,
    incrementNotificationCountByOne,
  } = useNotificationStore()

  useWebSocketConfig(isLoggedIn, isAdmin, refreshSession)
  useNotificationWebSocket(
    websocketOptions,
    (notification: UserNotificationType) => {
      if (notification) {
        setNotifications((prev) => {
          return {
            ...prev,
            content: [notification, ...(prev?.content ?? [])],
          }
        })
        incrementNotificationCountByOne()
        if (permission === 'granted') {
          createNotification('Notification', {
            body: 'You have a new notification 😎',
          })
        }
      }
    }
  )

  useEffect(() => {
    if (!user?.id || fetchNotificationsRef.current) return
    apiFetchUserNotifications(user.id, `page=1&pageSize=15`).then(
      (response) => {
        if (response.ok) {
          fetchNotificationsRef.current = true
          setNotifications(response.data)
          setNotificationCount(response.data?.unReadTotal ?? 0)
        }
      }
    )
  }, [user])

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
              pagebale={{
                page: notifications?.page ?? 1,
                pageSize: notifications?.pageSize ?? 15,
                totalPages: notifications?.totalPages ?? 0,
              }}
              unreadNotificationCount={notificationCount}
              latestReadNotificationId={latestReadNotificationId}
              notificationList={notifications?.content ?? []}
              onRead={(id) => {
                markNotificationAsRead(id)
                return apiReadNotification(id)
              }}
              onPaginationChange={async (pagination) => {
                return apiFetchUserNotifications(
                  user!.id,
                  `page=${pagination.page}&pageSize=${pagination.pageSize}`
                ).then((response) => {
                  if (response.ok) {
                    setNotifications(response.data)
                  }
                })
              }}
            ></DpNotificationBellComponentDynamic>
          )}
          <ModeToggle className="hidden sm:inline-block"></ModeToggle>
        </NavbarItems>
      </DpNextNavbar>

      <AnnouncementsComponent
        websocketOptions={websocketOptions}
      ></AnnouncementsComponent>

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

      <main className="mt-7">{children}</main>

      {isLoggedIn && <MobileNavbar></MobileNavbar>}
    </>
  )
}
