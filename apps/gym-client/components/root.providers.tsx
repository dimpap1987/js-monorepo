'use client'

import { DpLoaderProvider } from '@js-monorepo/loader'
import { QClientProvider } from '@js-monorepo/next/providers'
import { DpNotificationProvider } from '@js-monorepo/notification'
import { DpNextPageProgressBar } from '@js-monorepo/page-progress-bar'
import { getEnabledThemeIds, ThemeProvider } from '@js-monorepo/theme-provider'
import { ReactNode } from 'react'

interface RootProvidersProps {
  readonly children: ReactNode
}

export default function RootProviders({ children }: RootProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" themes={getEnabledThemeIds()} enableSystem>
      <DpNextPageProgressBar>
        <DpLoaderProvider>
          <DpNotificationProvider>
            <QClientProvider>{children}</QClientProvider>
          </DpNotificationProvider>
        </DpLoaderProvider>
      </DpNextPageProgressBar>
    </ThemeProvider>
  )
}
