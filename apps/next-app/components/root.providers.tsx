import { SessionProvider } from '@js-monorepo/auth/next/client'
import { DpLoaderProvider } from '@js-monorepo/loader'
import { QClientProvider } from '@js-monorepo/next/providers'
import { DpNotificationProvider } from '@js-monorepo/notification'
import { NotificationProvider } from '@js-monorepo/notifications-ui'
import { DpNextPageProgressBar } from '@js-monorepo/page-progress-bar'
import { getEnabledThemeIds, ThemeProvider } from '@js-monorepo/theme-provider'
import { WebNotificationProvider } from '@js-monorepo/web-notification'
import dynamic from 'next/dynamic'
import { ReactNode } from 'react'
import { WebSocketProviderWrapper } from './websocket-provider-wrapper'

const DynamicWebsocketProvider = dynamic(() => Promise.resolve({ default: WebSocketProviderWrapper }), {
  ssr: false,
})

export default async function RootProviders({
  session,
  children,
}: {
  readonly children: ReactNode
  readonly session: any
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" themes={getEnabledThemeIds()} enableSystem>
      <DpNextPageProgressBar>
        <SessionProvider value={session} endpoint="/session">
          <DynamicWebsocketProvider>
            <DpLoaderProvider>
              <DpNotificationProvider>
                <QClientProvider>
                  <NotificationProvider userId={session?.user?.id}>
                    <WebNotificationProvider>{children}</WebNotificationProvider>
                  </NotificationProvider>
                </QClientProvider>
              </DpNotificationProvider>
            </DpLoaderProvider>
          </DynamicWebsocketProvider>
        </SessionProvider>
      </DpNextPageProgressBar>
    </ThemeProvider>
  )
}
