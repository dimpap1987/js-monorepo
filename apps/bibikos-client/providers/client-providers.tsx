'use client'
import { SessionProvider, type SessionContextType } from '@js-monorepo/auth/next/client'
import { DpLoaderProvider } from '@js-monorepo/loader'
import { QClientProvider } from '@js-monorepo/next/providers'
import { DpNotificationProvider } from '@js-monorepo/notification'
import { NotificationProvider } from '@js-monorepo/notifications-ui'
import { DpNextPageProgressBar } from '@js-monorepo/page-progress-bar'
import { getEnabledThemeIds, ThemeProvider } from '@js-monorepo/theme-provider'
import { WebNotificationProvider } from '@js-monorepo/web-notification'
import { FeatureFlagsProvider } from '@js-monorepo/feature-flags-client'
import { ReactNode } from 'react'
import { AppConfig } from '../lib/app-config'
import { WebSocketProviderWrapper } from './websocket-provider-wrapper'
import { SchedulingProvider } from '../lib/scheduling'

interface RootProvidersProps {
  readonly children: ReactNode
  readonly session?: SessionContextType['session']
}

export default function ClientProviders({ children, session }: RootProvidersProps) {
  const featureFlags = (session as any)?.featureFlags ?? {}

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
              <FeatureFlagsProvider flags={featureFlags}>
                <SessionProvider value={session} endpoint="/session">
                  <WebSocketProviderWrapper>
                    <NotificationProvider userId={session?.user?.id}>
                      <SchedulingProvider>
                        <WebNotificationProvider>{children}</WebNotificationProvider>
                      </SchedulingProvider>
                    </NotificationProvider>
                  </WebSocketProviderWrapper>
                </SessionProvider>
              </FeatureFlagsProvider>
            </DpNotificationProvider>
          </DpLoaderProvider>
        </QClientProvider>
      </DpNextPageProgressBar>
    </ThemeProvider>
  )
}
