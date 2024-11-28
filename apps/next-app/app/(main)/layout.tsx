import { ContainerTemplate } from '@js-monorepo/templates'
import { PropsWithChildren } from 'react'

export default async function RootLayout({ children }: PropsWithChildren) {
  return <ContainerTemplate>{children}</ContainerTemplate>
}
