import { getCurrentSession } from '@js-monorepo/auth/next/server'
import { generateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next/types'
import { redirect } from 'next/navigation'
import { BookingsContent } from './bookings-content'

export const metadata: Metadata = generateMetadata({
  title: 'My Bookings',
  description: 'View and manage your class bookings',
})

export default async function BookingsPage() {
  const session = await getCurrentSession()

  if (!session?.user) {
    redirect('/auth/login')
  }

  return <BookingsContent />
}
