import { SessionProvider } from '@js-monorepo/auth/next/client'
import { DpLoaderProvider } from '@js-monorepo/loader'
import { QClientProvider } from '@js-monorepo/next/providers'
import { DpNotificationProvider } from '@js-monorepo/notification'
import { DpNextPageProgressBar } from '@js-monorepo/page-progress-bar'
import { getEnabledThemeIds, ThemeProvider } from '@js-monorepo/theme-provider'
import { ReactNode } from 'react'
import { AppConfig } from '../lib/app-config'

interface RootProvidersProps {
  readonly children: ReactNode
  readonly session?: any
}

export default async function RootProviders({ children, session }: RootProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={AppConfig.defaultTheme || 'system'}
      themes={getEnabledThemeIds()}
      enableSystem={false}
    >
      <DpNextPageProgressBar>
        <DpLoaderProvider>
          <DpNotificationProvider>
            <SessionProvider value={session} endpoint="/session">
              <QClientProvider>{children}</QClientProvider>
            </SessionProvider>
          </DpNotificationProvider>
        </DpLoaderProvider>
      </DpNextPageProgressBar>
    </ThemeProvider>
  )
}
