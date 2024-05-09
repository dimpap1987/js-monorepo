import { SessionProvider } from '@js-monorepo/auth-client'
import { DpNextPageProgressBar } from '@js-monorepo/page-progress-bar'
import { ThemeProvider } from '@js-monorepo/theme-provider'
import { getCurrentUser } from '@next-app/actions/session'
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { ReactNode } from 'react'
import MainTemplate from '../components/main.template'
import './global.css'

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
  const session = await getCurrentUser()

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${poppins.className} flex flex-col min-h-100svh bg-background-primary overflow-hidden`}
      >
        <SessionProvider
          value={{
            user: session?.user,
            isLoggedIn: !!session?.user,
          }}
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
        </SessionProvider>
      </body>
    </html>
  )
}
