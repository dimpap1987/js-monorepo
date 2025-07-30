import { SessionProvider } from '@js-monorepo/auth/next/client'
import { DpLoader, DpLoaderProvider } from '@js-monorepo/loader'
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
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <DpNextPageProgressBar>
        <SessionProvider
          endpoint="/session"
          fallback={
            <DpLoader
              message="Grabbing your session..."
              description="This will take exactly as long as your coffee break."
            />
          }
        >
          <DynamicWebsocketProvider>
            <DpLoaderProvider>
              <DpNotificationProvider>
                <WebNotificationProvider>
                  <QClientProvider>{children}</QClientProvider>
                </WebNotificationProvider>
              </DpNotificationProvider>
            </DpLoaderProvider>
          </DynamicWebsocketProvider>
        </SessionProvider>
      </DpNextPageProgressBar>
    </ThemeProvider>
  )
}
