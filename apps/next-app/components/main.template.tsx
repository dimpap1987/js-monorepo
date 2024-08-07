'use client'
import { authClient, useSession } from '@js-monorepo/auth-client'
import { DpLoginButton, DpLogoutButton } from '@js-monorepo/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { DpLogo, DpNextNavbar, NavbarItems } from '@js-monorepo/navbar'
import { DpNotificationBellComponent } from '@js-monorepo/notification-bell'
import { DpNextSidebar } from '@js-monorepo/sidebar'
import { ModeToggle } from '@js-monorepo/theme-provider'
import { MenuItem } from '@js-monorepo/types'
import { DpVersion } from '@js-monorepo/version'
import { PropsWithChildren, useState } from 'react'
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

export default function MainTemplate({
  children,
}: Readonly<PropsWithChildren>) {
  const { user, isLoggedIn } = useSession()
  const [openSideBar, setOpenSideBar] = useState(false)

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
        <DpLogo>
          <SVGLogo></SVGLogo>
        </DpLogo>
        <NavbarItems>
          {isLoggedIn && (
            <DpNotificationBellComponent className="hidden sm:block"></DpNotificationBellComponent>
          )}
          <ModeToggle></ModeToggle>
        </NavbarItems>
      </DpNextNavbar>

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
              <DpLoginButton></DpLoginButton>
            </DpNextNavLink>
          )}
          {!!user && (
            <DpLogoutButton
              className="p-3 justify-center text-white"
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
