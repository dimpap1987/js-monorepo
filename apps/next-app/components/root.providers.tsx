import { SessionProvider } from '@js-monorepo/auth/next/client'
import { DpLoaderProvider } from '@js-monorepo/loader'
import { WebSocketProvider } from '@js-monorepo/next/providers'
import { DpNotificationProvider } from '@js-monorepo/notification'
import { DpNextPageProgressBar } from '@js-monorepo/page-progress-bar'
import { ThemeProvider } from '@js-monorepo/theme-provider'
import { WebNotificationProvider } from '@js-monorepo/web-notification'
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
      <WebSocketProvider>
        <DpNextPageProgressBar>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <DpLoaderProvider>
              <DpNotificationProvider>
                <WebNotificationProvider>{children}</WebNotificationProvider>
              </DpNotificationProvider>
            </DpLoaderProvider>
          </ThemeProvider>
        </DpNextPageProgressBar>
      </WebSocketProvider>
    </SessionProvider>
  )
}
