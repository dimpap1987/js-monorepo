import { DpVersion } from '@js-monorepo/version'
import { MobileNavbar } from '@next-app/components/mobile-navbar'
import { PropsWithChildren } from 'react'

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <>
      <main className="flex p-3 flex-grow container [&>*]:flex-grow">
        {children}
        <MobileNavbar></MobileNavbar>
      </main>
      <footer className="text-center py-4">
        <DpVersion></DpVersion>
      </footer>
    </>
  )
}
