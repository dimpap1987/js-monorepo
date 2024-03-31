'use client'
import { DpLoginButton, DpLogoutButton } from '@js-monorepo/button'
import { DpLoaderProvider } from '@js-monorepo/loader'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { DpLogo, DpNextNavbar } from '@js-monorepo/navbar'
import { DpNotificationProvider } from '@js-monorepo/notification'
import { DpNextSidebar, MenuItem } from '@js-monorepo/sidebar'
import { DpVersion } from '@js-monorepo/version'
import { PropsWithChildren, useState } from 'react'
import { logout } from '../actions/logout'
import { useCurrentUser } from '../app/hooks/use-current-user'
import SVGLogo from './logo-svg'

const menuItems: MenuItem[] = [
  {
    href: '/',
    name: 'Home',
  },
  {
    href: '/about',
    name: 'About',
  },
]

export default function MainTemplate({
  children,
}: Readonly<PropsWithChildren>) {
  const user = useCurrentUser()
  const [openSideBar, setOpenSideBar] = useState(false)

  return (
    <>
      {/* <StoreInitializer
        userStore={{ data: user, setUser, removeUser }}
      ></StoreInitializer> */}

      <DpNextNavbar
        user={{ isLoggedIn: !!user, username: user?.name }}
        menuItems={menuItems}
        onSideBarClick={() => {
          setOpenSideBar((prev) => !prev)
        }}
        onLogout={() => {
          logout()
        }}
      >
        <DpLogo>
          <SVGLogo></SVGLogo>
        </DpLogo>
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
              className="p-3"
              onClick={() => {
                logout()
                setOpenSideBar(false)
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
