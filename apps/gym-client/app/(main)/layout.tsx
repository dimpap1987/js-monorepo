import { PropsWithChildren } from 'react'

import { generateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next/types'

export const metadata: Metadata = generateMetadata({
  keywords: ['web app', 'next.js', 'modern application', 'saas'],
  type: 'website',
})

export default async function MainLayout({ children }: PropsWithChildren) {
  return <>{children}</>
}
