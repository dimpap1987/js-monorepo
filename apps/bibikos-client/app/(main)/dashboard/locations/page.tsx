import { generateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next/types'
import { LocationsContent } from './locations-content'

export const metadata: Metadata = generateMetadata({
  title: 'Locations',
  description: 'Manage your teaching locations',
})

export default async function LocationsPage() {
  return <LocationsContent />
}
