'use client'
import { DpLoaderProvider } from '@js-monorepo/loader'
import { DpLogo, DpNextNavbar, UserNavSocial } from '@js-monorepo/navbar'
import { DpNotificationProvider } from '@js-monorepo/notification'
import { DpVersion } from '@js-monorepo/version'
import React, { PropsWithChildren } from 'react'
import { useUserStore } from '@js-monorepo/store'
import StoreInitializer from './store.initializer'
import SVGLogo from './logo-svg'
import { MenuItem } from '@js-monorepo/sidebar'

export default function MainTemplate({ children }: PropsWithChildren) {
  const { data: user, setUser, removeUser } = useUserStore()
  const socials: UserNavSocial[] = [
    {
      type: 'github',
      onLogin: () => {
        setUser({ isLoggedIn: true, username: 'github_user' })
      },
    },
    {
      type: 'google',
      onLogin: () => {
        setUser({ isLoggedIn: true, username: 'google_user' })
      },
    },
    {
      type: 'facebook',
      onLogin: () => {
        setUser({ isLoggedIn: true, username: 'facebook_user' })
      },
    },
  ]

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
  return (
    <>
      {/* <StoreInitializer
        userStore={{ data: user, setUser, removeUser }}
      ></StoreInitializer> */}

      <DpNextNavbar
        user={{ isLoggedIn: user.isLoggedIn, username: user.username }}
        socialLogin={socials}
        menuItems={menuItems}
        onLogout={() => {
          removeUser()
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
