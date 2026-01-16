import { getCurrentSession } from '@js-monorepo/auth/next/server'
import { generateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next/types'
import { redirect } from 'next/navigation'
import { LocationsContent } from './locations-content'

export const metadata: Metadata = generateMetadata({
  title: 'Locations',
  description: 'Manage your teaching locations',
})

export default async function LocationsPage() {
  const session = await getCurrentSession()

  if (!session?.user) {
    redirect('/auth/login')
  }

  return <LocationsContent />
}
