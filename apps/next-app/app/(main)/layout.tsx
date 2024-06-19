import { DpVersion } from '@js-monorepo/version'
import { PropsWithChildren } from 'react'

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <>
      <main className="flex p-3 flex-grow container mx-auto min-w-[200px] [&>*]:flex-grow">
        {children}
      </main>
      <footer className="text-center py-4">
        <DpVersion></DpVersion>
      </footer>
    </>
  )
}
