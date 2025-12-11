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
import { WebSocketProviderWrapper } from './websocket-provider-wrapper'

const DynamicWebsocketProvider = dynamic(() => Promise.resolve({ default: WebSocketProviderWrapper }), {
  ssr: false,
})

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
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            themes={['light', 'dark', 'blue', 'green', 'dark-blue']}
            enableSystem
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
      </DynamicWebsocketProvider>
    </SessionProvider>
  )
}
