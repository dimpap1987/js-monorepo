import { SessionProvider } from '@js-monorepo/auth/next/client'
import { getCurrentSession } from '@js-monorepo/auth/next/server'
import { DpLoaderProvider } from '@js-monorepo/loader'
import { QClientProvider } from '@js-monorepo/next/providers'
import { DpNotificationProvider } from '@js-monorepo/notification'
import { DpNextPageProgressBar } from '@js-monorepo/page-progress-bar'
import { ThemeProvider } from '@js-monorepo/theme-provider'
import { WebNotificationProvider } from '@js-monorepo/web-notification'
import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

const DynamicWebsocketProvider = dynamic(
  () => import('@js-monorepo/next/providers').then((module) => module.WebSocketProvider),
  {
    ssr: false,
  }
)

export default async function RootProviders({ children }: { readonly children: ReactNode }) {
  const session = await getCurrentSession()
  return (
    <SessionProvider
      value={{
        isLoggedIn: !!session?.user,
        ...session,
      }}
      endpoint="/session"
    >
      <ThemeProvider attribute="class" defaultTheme="dark">
        <DynamicWebsocketProvider>
          <DpNextPageProgressBar>
            <DpLoaderProvider>
              <DpNotificationProvider>
                <WebNotificationProvider>
                  <QClientProvider>{children}</QClientProvider>
                </WebNotificationProvider>
              </DpNotificationProvider>
            </DpLoaderProvider>
          </DpNextPageProgressBar>
        </DynamicWebsocketProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
