import type { SessionContextType } from '@js-monorepo/auth/next/client'
import { ReactNode } from 'react'
import ClientProviders from './client-providers'

interface RootProvidersProps {
  readonly children: ReactNode
  readonly session?: SessionContextType['session']
}

export default function RootProviders({ children, session }: RootProvidersProps) {
  return <ClientProviders session={session}>{children}</ClientProviders>
}
