'use client'

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@js-monorepo/components/ui/sidebar'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { Navbar } from '@js-monorepo/navbar'
import { DpNextSidebar } from '@js-monorepo/sidebar'
import { PropsWithChildren } from 'react'
import { AppConfig } from '../lib/app-config'

export default function RootComponent({ children }: PropsWithChildren) {
  return (
    <SidebarProvider defaultOpen={false}>
      <DpNextSidebar items={[]}></DpNextSidebar>

      <SidebarInset asChild>
        <section className="flex min-h-screen flex-col">
          {/* Navbar */}
          <Navbar
            logo={
              <DpNextNavLink href="/" className="font-bold text-lg">
                {AppConfig.appName}
              </DpNextNavLink>
            }
            sidebarTrigger={<SidebarTrigger />}
          ></Navbar>

          {/* Main */}
          <main className="flex-1">{children}</main>
        </section>
      </SidebarInset>
    </SidebarProvider>
  )
}
