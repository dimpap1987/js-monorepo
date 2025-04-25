import { SessionProvider } from '@js-monorepo/auth/next/client'
import { DpLoaderProvider } from '@js-monorepo/loader'
import { QClientProvider } from '@js-monorepo/next/providers'
import { DpNotificationProvider } from '@js-monorepo/notification'
import { DpNextPageProgressBar } from '@js-monorepo/page-progress-bar'
import { ThemeProvider } from '@js-monorepo/theme-provider'
import { WebNotificationProvider } from '@js-monorepo/web-notification'
import { getCurrentUser } from '@next-app/actions/session'
import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

const DynamicWebsocketProvider = dynamic(
  () => import('@js-monorepo/next/providers').then((module) => module.WebSocketProvider),
  {
    ssr: false,
  }
)

export default async function RootProviders({ children }: { readonly children: ReactNode }) {
  const session = await getCurrentUser()

  return (
    <SessionProvider
      value={{
        session: session ? { ...session } : null,
        isLoggedIn: !!session?.user,
      }}
      endpoint="/session"
    >
      <DynamicWebsocketProvider>
        <DpNextPageProgressBar>
          <ThemeProvider attribute="class" defaultTheme="system">
            <DpLoaderProvider>
              <DpNotificationProvider>
                <WebNotificationProvider>
                  <QClientProvider>{children}</QClientProvider>
                </WebNotificationProvider>
              </DpNotificationProvider>
            </DpLoaderProvider>
          </ThemeProvider>
        </DpNextPageProgressBar>
      </DynamicWebsocketProvider>
    </SessionProvider>
  )
}
