'use client'

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@js-monorepo/components/ui/sidebar'
import { Navbar, NavbarItems, NavbarLogo, NavbarSidebarTrigger } from '@js-monorepo/navbar'
import { DpNextSidebar } from '@js-monorepo/sidebar'
import { useRouter } from 'next-nprogress-bar'
import { PropsWithChildren } from 'react'

export default function RootComponent({ children }: PropsWithChildren) {
  const router = useRouter()

  return (
    <SidebarProvider defaultOpen={false}>
      <DpNextSidebar items={[]}></DpNextSidebar>

      <SidebarInset asChild>
        <section className="flex min-h-screen flex-col">
          {/* Navbar */}
          <Navbar>
            <NavbarLogo onClick={() => router.push('/')}>App name</NavbarLogo>
            <NavbarItems />
            <NavbarSidebarTrigger>
              <SidebarTrigger />
            </NavbarSidebarTrigger>
          </Navbar>

          {/* Main */}
          <main className="flex-1">{children}</main>
        </section>
      </SidebarInset>
    </SidebarProvider>
  )
}
