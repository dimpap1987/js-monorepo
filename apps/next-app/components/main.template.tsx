'use client'
import { DpLoaderProvider } from '@js-monorepo/loader'
import { DpLogo, DpNextNavbar } from '@js-monorepo/navbar'
import { DpNotificationProvider } from '@js-monorepo/notification'
import { DpVersion } from '@js-monorepo/version'
import React, { PropsWithChildren } from 'react'
import StoreInitializer from './store.initializer'
import SVGLogo from './logo-svg'
import { MenuItem } from '@js-monorepo/sidebar'
import { useCurrentUser } from '../app/hooks/use-current-user'
import { logout } from '../actions/logout'

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

export default function MainTemplate({ children }: PropsWithChildren) {
  const user = useCurrentUser()

  return (
    <>
      {/* <StoreInitializer
        userStore={{ data: user, setUser, removeUser }}
      ></StoreInitializer> */}

      <DpNextNavbar
        user={{ isLoggedIn: !!user, username: user?.name }}
        menuItems={menuItems}
        onLogout={() => {
          logout()
        }}
      >
        <DpLogo>
          <SVGLogo></SVGLogo>
        </DpLogo>
      </DpNextNavbar>

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
