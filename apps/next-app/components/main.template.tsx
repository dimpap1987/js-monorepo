'use client'
import { authClient, useSession } from '@js-monorepo/auth-client'
import { DpLoginButton, DpLogoutButton } from '@js-monorepo/button'
import { DpLoaderProvider } from '@js-monorepo/loader'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { DpLogo, DpNextNavbar, NavbarItems } from '@js-monorepo/navbar'
import { DpNotificationProvider } from '@js-monorepo/notification'
import { DpNotificationBellComponent } from '@js-monorepo/notification-bell'
import { DpNextSidebar, MenuItem } from '@js-monorepo/sidebar'
import { ModeToggle } from '@js-monorepo/theme-provider'
import { DpVersion } from '@js-monorepo/version'
import { PropsWithChildren, useState } from 'react'
import SVGLogo from './logo-svg'

const menuItems: MenuItem[] = [
  {
    href: '/',
    name: 'Home',
  },
  {
    href: '/ai-image-generator',
    name: 'AI Image Generator',
  },
  {
    href: '/about',
    name: 'About',
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
          username: user?.username,
          createdAt: user?.createdAt,
          userProfileImage: user?.picture,
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
            <DpNotificationBellComponent></DpNotificationBellComponent>
          )}
          <ModeToggle></ModeToggle>
        </NavbarItems>
      </DpNextNavbar>

      <DpNextSidebar
        isOpen={openSideBar}
        onClose={() => setOpenSideBar(false)}
        position="right"
        items={menuItems}
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

      <DpLoaderProvider>
        <DpNotificationProvider>
          <main className="p-3 flex-grow container mx-auto min-w-[200px]">
            {children}
          </main>
          <footer className="text-center py-4">
            <DpVersion></DpVersion>
          </footer>
        </DpNotificationProvider>
      </DpLoaderProvider>
    </>
  )
}
