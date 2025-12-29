import { getCurrentSession } from '@js-monorepo/auth/next/server'
import { SessionProvider } from '@js-monorepo/auth/next/client'
import { DpLoader, DpLoaderProvider } from '@js-monorepo/loader'
import { QClientProvider } from '@js-monorepo/next/providers'
import { DpNotificationProvider } from '@js-monorepo/notification'
import { DpNextPageProgressBar } from '@js-monorepo/page-progress-bar'
import { ThemeProvider } from '@js-monorepo/theme-provider'
import { WebNotificationProvider } from '@js-monorepo/web-notification'
import dynamic from 'next/dynamic'
import { ReactNode } from 'react'
import { WebSocketProviderWrapper } from './websocket-provider-wrapper'
import { NotificationProvider } from '@js-monorepo/notifications-ui'

const DynamicWebsocketProvider = dynamic(() => Promise.resolve({ default: WebSocketProviderWrapper }), {
  ssr: false,
})

export default async function RootProviders({ children }: { readonly children: ReactNode }) {
  const session = await getCurrentSession()

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      themes={[
        'light',
        'dark',
        'blue',
        'green',
        'dark-blue',
        'retro',
        'dracula',
        'nord',
        'monokai',
        'tokyonight',
        'solarized',
        'gruvbox',
        'catppuccin',
        'onedark',
        'synthwave',
        'red',
      ]}
      enableSystem
    >
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
