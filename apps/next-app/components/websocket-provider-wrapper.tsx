'use client'

import { SessionProvider, useSession } from '@js-monorepo/auth/next/client'
import { WebSocketProvider } from '@js-monorepo/next/providers'
import { websocketOptions } from '@next-app/utils/websocket.config'
import { ReactNode } from 'react'

export function WebSocketProviderWrapper({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useSession()
  return (
    <WebSocketProvider options={websocketOptions} shouldConnect={isLoggedIn}>
      {children}
    </WebSocketProvider>
  )
}
