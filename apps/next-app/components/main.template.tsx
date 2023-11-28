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

export interface MainTemplateProps {
  children: React.ReactNode
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
  return (
    <>
      {/* <StoreInitializer
        userStore={{ data: user, setUser, removeUser }}
      ></StoreInitializer> */}
      <NavbarComponent
        user={{ isLoggedIn: user.isLoggedIn, username: user.username }}
        socialLogin={socials}
        onLogout={() => {
          removeUser()
        }}
      >
        <LogoComponent href="/">
          <h1>DPap</h1>
        </LogoComponent>
      </NavbarComponent>
      <LoaderComponent>
        <NotificationComponent>
          <main className="p-2 flex-grow container mx-auto min-w-[200px]">
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
