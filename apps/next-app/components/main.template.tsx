import { LoaderComponent } from '@js-monorepo/loader'
import { LogoComponent, NavbarComponent } from '@js-monorepo/navbar'
import { NotificationComponent } from '@js-monorepo/notification'
import { VersionComponent } from '@js-monorepo/version'
import React from 'react'

export interface MainTemplateProps {
  children: React.ReactNode
}
export default function MainTemplate({ children }: MainTemplateProps) {
  return (
    <>
      <NavbarComponent>
        <LogoComponent>
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
