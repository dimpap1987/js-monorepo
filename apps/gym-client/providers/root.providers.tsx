import { ReactNode } from 'react'
import ClientProviders from './client-providers'

interface RootProvidersProps {
  readonly children: ReactNode
  readonly session?: any
}

export default function RootProviders({ children, session }: RootProvidersProps) {
  return <ClientProviders session={session}>{children}</ClientProviders>
}
