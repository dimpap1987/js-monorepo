import { generateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next/types'
import DiscoverComponent from './discover'

export const metadata: Metadata = generateMetadata({
  title: 'Discover',
  description: 'discover all the available classes',
})

export default async function DiscoverPage() {
  return <DiscoverComponent />
}
