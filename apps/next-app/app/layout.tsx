import { Poppins } from 'next/font/google'
import MainTemplate from '../components/main.template'
import './global.css'
import { DpNextPageProgressBar } from '@js-monorepo/page-progress-bar'
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { auth } from '../auth'
import { ThemeProvider } from '@js-monorepo/theme-provider'

export const metadata: Metadata = {
  title: 'Next-14 App ',
}

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-poppins',
  display: 'swap',
  adjustFontFallback: false,
})

export default async function RootLayout(props: {
  readonly children: ReactNode
  readonly auth: ReactNode
}) {
  const session = await auth()
  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body
          className={`${poppins.className} flex flex-col min-h-100svh bg-background-primary`}
          suppressHydrationWarning={true}
        >
          <DpNextPageProgressBar>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <MainTemplate>
                {props.auth}
                {props.children}
              </MainTemplate>
            </ThemeProvider>
          </DpNextPageProgressBar>
        </body>
      </html>
    </SessionProvider>
  )
}
