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
  useNotificationStore,
  useNotificationWebSocket,
} from '@js-monorepo/notifications-ui'
import { DpNextSidebar } from '@js-monorepo/sidebar'
import { MenuItem, PaginationType, UserNotificationType } from '@js-monorepo/types'
import { useWebSocketConfig } from '@next-app/hooks/useWebsocketConfig'
import { websocketOptions } from '@next-app/utils/websocket.config'
import { useRouter } from 'next-nprogress-bar'
import dynamic from 'next/dynamic'
import { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react'
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

const DpNotificationBellComponentDynamic = dynamic(
  () => import('@js-monorepo/notifications-ui').then((module) => module.DpNotificationBellComponent),
  { ssr: false }
)

export default function MainTemplate({ children }: Readonly<PropsWithChildren>) {
  const {
    session: { user },
    isLoggedIn,
    isAdmin,
    refreshSession,
  } = useSession()
  const [openSideBar, setOpenSideBar] = useState(false)
  const fetchNotificationsRef = useRef(false)
  const router = useRouter()
  const [notifications, setNotifications] = useState<Partial<PaginationType> | undefined>()
  // Track accumulated notifications across pagination
  const accumulatedNotificationsRef = useRef<UserNotificationType[]>([])

  const {
    notificationCount,
    markNotificationAsRead,
    latestReadNotificationId,
    setNotificationCount,
    incrementNotificationCountByOne,
  } = useNotificationStore()

  useWebSocketConfig(isLoggedIn, isAdmin, refreshSession)

  const updateNotificationsContent = useCallback(
    (updater: (prev: UserNotificationType[]) => UserNotificationType[]) => {
      setNotifications((prev) => {
        const currentContent = prev?.content ?? []
        const updatedContent = updater(currentContent)
        accumulatedNotificationsRef.current = updatedContent
        return {
          ...prev,
          content: updatedContent,
        }
      })
    },
    []
  )

  const addOrUpdateNotification = useCallback(
    (notification: UserNotificationType) => {
      const existing = accumulatedNotificationsRef.current.find(
        (n) => n.notification.id === notification.notification.id
      )

      if (existing) {
        updateNotificationsContent((prev) => {
          const index = prev.findIndex((n) => n.notification.id === notification.notification.id)
          if (index >= 0) {
            const updated = [...prev]
            updated[index] = { ...notification, isRead: existing.isRead }
            return updated
          }
          return prev
        })
      } else {
        if (!notification.isRead) {
          incrementNotificationCountByOne()
        }
        updateNotificationsContent((prev) => [notification, ...prev])
      }
    },
    [updateNotificationsContent, incrementNotificationCountByOne]
  )

  const [pendingNotification, setPendingNotification] = useState<UserNotificationType | null>(null)

  useNotificationWebSocket((notification: UserNotificationType) => {
    if (notification) {
      setPendingNotification(notification)
    }
  })

  useEffect(() => {
    if (pendingNotification) {
      addOrUpdateNotification(pendingNotification)
      setPendingNotification(null)
    }
  }, [pendingNotification, addOrUpdateNotification])

  useEffect(() => {
    if (!user?.id || fetchNotificationsRef.current) return
    apiFetchUserNotifications(user.id, `?page=${initialPage}&pageSize=${initialPageSize}`).then((response) => {
      if (response.ok) {
        fetchNotificationsRef.current = true
        const initialContent = response.data?.content ?? []
        accumulatedNotificationsRef.current = initialContent
        setNotifications(response.data)
        setNotificationCount(response.data?.unReadTotal ?? 0)
      }
    })
  }, [user, setNotificationCount])

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
              unreadNotificationCount={notificationCount}
              latestReadNotificationId={latestReadNotificationId}
              notificationList={notifications?.content ?? []}
              onRead={async (id) => {
                markNotificationAsRead(id)
                const response = await apiReadNotification(id)
                if (response.ok) {
                  updateNotificationsContent((prev) =>
                    prev.map((item) => (item.notification.id === id ? { ...item, isRead: true } : item))
                  )
                }
                return response
              }}
              onReadAll={async () => {
                if (notificationCount === 0) return false

                const response = await apiReadAllNotifications()
                if (response.ok) {
                  setNotificationCount(0)
                  updateNotificationsContent((prev) => prev.map((item) => ({ ...item, isRead: true })))
                  return true
                }
                return false
              }}
              onPaginationChange={async (pagination) => {
                if (!user?.id) return Promise.resolve()
                return apiFetchUserNotifications(
                  user.id,
                  `?page=${pagination.page}&pageSize=${pagination.pageSize}`
                ).then((response) => {
                  if (response.ok) {
                    const newPageContent = response.data?.content ?? []
                    const existingIds = new Set(accumulatedNotificationsRef.current.map((n) => n.notification.id))
                    const newNotifications = newPageContent.filter((n) => !existingIds.has(n.notification.id))
                    const mergedContent = [...newNotifications, ...accumulatedNotificationsRef.current].sort(
                      (a, b) => b.notification.id - a.notification.id
                    )
                    accumulatedNotificationsRef.current = mergedContent
                    setNotifications({
                      ...response.data,
                      content: mergedContent,
                    })
                  }
                })
              }}
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
