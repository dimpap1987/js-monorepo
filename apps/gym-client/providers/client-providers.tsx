'use client'
import { SessionProvider } from '@js-monorepo/auth/next/client'
import { DpLoaderProvider } from '@js-monorepo/loader'
import { QClientProvider } from '@js-monorepo/next/providers'
import { DpNotificationProvider } from '@js-monorepo/notification'
import { DpNextPageProgressBar } from '@js-monorepo/page-progress-bar'
import { getEnabledThemeIds, ThemeProvider } from '@js-monorepo/theme-provider'
import { ReactNode } from 'react'
import { AppConfig } from '../lib/app-config'
import { WebSocketProviderWrapper } from './websocket-provider-wrapper'

interface RootProvidersProps {
  readonly children: ReactNode
  readonly session?: any
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
                <WebSocketProviderWrapper>{children}</WebSocketProviderWrapper>
              </SessionProvider>
            </DpNotificationProvider>
          </DpLoaderProvider>
        </QClientProvider>
      </DpNextPageProgressBar>
    </ThemeProvider>
  )
}
