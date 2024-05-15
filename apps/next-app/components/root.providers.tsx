import { SessionProvider } from '@js-monorepo/auth-client'
import { DpLoaderProvider } from '@js-monorepo/loader'
import { DpNotificationProvider } from '@js-monorepo/notification'
import { DpNextPageProgressBar } from '@js-monorepo/page-progress-bar'
import { ThemeProvider } from '@js-monorepo/theme-provider'
import { getCurrentUser } from '@next-app/actions/session'
import { ReactNode } from 'react'

export default async function RootProviders({
  children,
}: {
  readonly children: ReactNode
}) {
  const session = await getCurrentUser()

  return (
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
          <DpLoaderProvider>
            <DpNotificationProvider>{children}</DpNotificationProvider>
          </DpLoaderProvider>
        </ThemeProvider>
      </DpNextPageProgressBar>
    </SessionProvider>
  )
}
