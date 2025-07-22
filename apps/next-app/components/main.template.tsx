'use client'
import { AnnouncementsComponent } from '@js-monorepo/announcements'
import { authClient, useSession } from '@js-monorepo/auth/next/client'
import { DpLoginButton, DpLogoutButton } from '@js-monorepo/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { DpLogo, DpNextNavbar, NavbarItems } from '@js-monorepo/navbar'
import {
  apiFetchUserNotifications,
  apiReadAllNotifications,
  apiReadNotification,
  DpNotificationBellComponent,
  useNotificationStore,
  useNotificationWebSocket,
} from '@js-monorepo/notifications-ui'
import { DpNextSidebar } from '@js-monorepo/sidebar'
import { ModeToggle } from '@js-monorepo/theme-provider'
import { MenuItem, PaginationType, UserNotificationType } from '@js-monorepo/types'
import { useWebSocketConfig } from '@next-app/hooks/useWebsocketConfig'
import { websocketOptions } from '@next-app/utils/websocket.config'
import { useRouter } from 'next-nprogress-bar'
import dynamic from 'next/dynamic'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'
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
const initialPageSize = 10

export default function MainTemplate({ children }: Readonly<PropsWithChildren>) {
  const { session, isLoggedIn, isAdmin, refreshSession } = useSession()
  const [openSideBar, setOpenSideBar] = useState(false)
  const fetchNotificationsRef = useRef(false)
  const router = useRouter()
  const [notifications, setNotifications] = useState<Partial<PaginationType> | undefined>()
  const user = session?.user

  const {
    notificationCount,
    markNotificationAsRead,
    latestReadNotificationId,
    setNotificationCount,
    incrementNotificationCountByOne,
  } = useNotificationStore()

  useWebSocketConfig(isLoggedIn, isAdmin, refreshSession)
  useNotificationWebSocket(websocketOptions, (notification: UserNotificationType) => {
    if (notification) {
      setNotifications((prev) => {
        return {
          ...prev,
          content: [notification, ...(prev?.content ?? [])],
        }
      })
      incrementNotificationCountByOne()
    }
  })

  useEffect(() => {
    if (!user?.id || fetchNotificationsRef.current) return
    apiFetchUserNotifications(user.id, `?page=${initialPage}&pageSize=${initialPageSize}`).then((response) => {
      if (response.ok) {
        fetchNotificationsRef.current = true
        setNotifications(response.data)
        setNotificationCount(response.data?.unReadTotal ?? 0)
      }
    })
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
            <DpNotificationBellComponent
              className="mt-[0.58rem]"
              pagebale={{
                page: notifications?.page ?? initialPage,
                pageSize: notifications?.pageSize ?? initialPageSize,
                totalPages: notifications?.totalPages ?? 0,
              }}
              unreadNotificationCount={notificationCount}
              latestReadNotificationId={latestReadNotificationId}
              notificationList={notifications?.content ?? []}
              onRead={(id) => {
                markNotificationAsRead(id)
                return apiReadNotification(id)
              }}
              onReadAll={async () => {
                if (notificationCount === 0) return false

                const response = await apiReadAllNotifications()
                if (response.ok) {
                  setNotificationCount(0)
                  return true
                }
                return false
              }}
              onPaginationChange={async (pagination) => {
                return apiFetchUserNotifications(
                  user!.id,
                  `?page=${pagination.page}&pageSize=${pagination.pageSize}`
                ).then((response) => {
                  if (response.ok) {
                    setNotifications(response.data)
                  }
                })
              }}
              resetOnClose={true}
            ></DpNotificationBellComponent>
          )}
          <ModeToggle></ModeToggle>
        </NavbarItems>
      </DpNextNavbar>

      <AnnouncementsComponent
        className="fixed top-[calc(var(--navbar-height)_+_5px)] h-5 z-50"
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
              className="p-3 mb-6 justify-center"
              size="large"
              onClick={async () => {
                authClient.logout()
              }}
            ></DpLogoutButton>
          )}
        </div>
      </DpNextSidebar>

      <main className="mt-5">{children}</main>

      {isLoggedIn && <MobileNavbar></MobileNavbar>}
    </>
  )
}
