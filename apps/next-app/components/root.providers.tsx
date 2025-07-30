'use client'

import { SessionProvider } from '@js-monorepo/auth/next/client'
import { DpLoaderProvider } from '@js-monorepo/loader'
import { QClientProvider, WebSocketProvider } from '@js-monorepo/next/providers'
import { DpNotificationProvider } from '@js-monorepo/notification'
import { DpNextPageProgressBar } from '@js-monorepo/page-progress-bar'
import { ThemeProvider } from '@js-monorepo/theme-provider'
import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

const DynamicWebNotificationProvider = dynamic(
  () => import('@js-monorepo/web-notification').then((mod) => mod.WebNotificationProvider),
  {
    ssr: false,
  }
)

export default function RootProviders({ children }: { readonly children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <SessionProvider endpoint="/session">
        <WebSocketProvider>
          <DpNextPageProgressBar>
            <DpLoaderProvider>
              <DpNotificationProvider>
                <DynamicWebNotificationProvider>
                  <QClientProvider>{children}</QClientProvider>
                </DynamicWebNotificationProvider>
              </DpNotificationProvider>
            </DpLoaderProvider>
          </DpNextPageProgressBar>
        </WebSocketProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
