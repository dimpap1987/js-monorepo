'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { WebSocketProvider } from '@js-monorepo/next/providers'
import { ReactNode } from 'react'

export function WebSocketProviderWrapper({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useSession()
  return <WebSocketProvider shouldConnect={isLoggedIn}>{children}</WebSocketProvider>
}
