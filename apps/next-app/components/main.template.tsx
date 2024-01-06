'use client'
import { LoaderComponent } from '@js-monorepo/loader'
import {
  LogoComponent,
  NavbarComponent,
  UserNavSocial,
} from '@js-monorepo/navbar'
import { NotificationComponent } from '@js-monorepo/notification'
import { VersionComponent } from '@js-monorepo/version'
import React from 'react'
import { useUserStore } from '@js-monorepo/store'
import StoreInitializer from './store.initializer'
import SVGLogo from './logo-svg'
import { MenuItem } from '@js-monorepo/sidebar'

export interface MainTemplateProps {
  readonly children: React.ReactNode
}

export default function MainTemplate({ children }: MainTemplateProps) {
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
      <header className="z-40">
        <NavbarComponent
          user={{ isLoggedIn: user.isLoggedIn, username: user.username }}
          socialLogin={socials}
          menuItems={menuItems}
          onLogout={() => {
            removeUser()
          }}
        >
          <LogoComponent href="/">
            <SVGLogo></SVGLogo>
          </LogoComponent>
        </NavbarComponent>
      </header>
      <LoaderComponent>
        <NotificationComponent>
          <main className="p-3 flex-grow container mx-auto min-w-[200px]">
            {children}
          </main>
          <footer className="text-center py-4">
            <VersionComponent></VersionComponent>
          </footer>
        </NotificationComponent>
      </LoaderComponent>
    </>
  )
}
