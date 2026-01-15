'use client'
import { SessionProvider, type SessionContextType } from '@js-monorepo/auth/next/client'
import { DpLoaderProvider } from '@js-monorepo/loader'
import { QClientProvider } from '@js-monorepo/next/providers'
import { DpNotificationProvider } from '@js-monorepo/notification'
import { NotificationProvider } from '@js-monorepo/notifications-ui'
import { DpNextPageProgressBar } from '@js-monorepo/page-progress-bar'
import { getEnabledThemeIds, ThemeProvider } from '@js-monorepo/theme-provider'
import { WebNotificationProvider } from '@js-monorepo/web-notification'
import { ReactNode } from 'react'
import { AppConfig } from '../lib/app-config'
import { WebSocketProviderWrapper } from './websocket-provider-wrapper'

interface RootProvidersProps {
  readonly children: ReactNode
  readonly session?: SessionContextType['session']
}

export default function ClientProviders({ children, session }: RootProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={AppConfig.defaultTheme || 'system'}
      themes={getEnabledThemeIds()}
      enableSystem={false}
    >
      <DpNextPageProgressBar>
        <QClientProvider>
          <DpLoaderProvider>
            <DpNotificationProvider>
              <SessionProvider value={session} endpoint="/session">
                <WebSocketProviderWrapper>
                  <NotificationProvider userId={session?.user?.id}>
                    <WebNotificationProvider>{children}</WebNotificationProvider>
                  </NotificationProvider>
                </WebSocketProviderWrapper>
              </SessionProvider>
            </DpNotificationProvider>
          </DpLoaderProvider>
        </QClientProvider>
      </DpNextPageProgressBar>
    </ThemeProvider>
  )
}
