import { SessionProvider } from '@js-monorepo/auth/next/client'
import { DpLoaderProvider } from '@js-monorepo/loader'
import { QClientProvider, WebSocketProvider } from '@js-monorepo/next/providers'
import { DpNotificationProvider } from '@js-monorepo/notification'
import { DpNextPageProgressBar } from '@js-monorepo/page-progress-bar'
import { ThemeProvider } from '@js-monorepo/theme-provider'
import { WebNotificationProvider } from '@js-monorepo/web-notification'
// import { getCurrentUser } from '@next-app/actions/session'
import { ReactNode } from 'react'

export default async function RootProviders({
  children,
}: {
  readonly children: ReactNode
}) {
  // const session = await getCurrentUser()

  return (
    <SessionProvider
      value={{
        session: {},
        isLoggedIn: false,
      }}
      endpoint="/session"
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
                <WebNotificationProvider>
                  <QClientProvider>{children}</QClientProvider>
                </WebNotificationProvider>
              </DpNotificationProvider>
            </DpLoaderProvider>
          </ThemeProvider>
        </DpNextPageProgressBar>
      </WebSocketProvider>
    </SessionProvider>
  )
}
