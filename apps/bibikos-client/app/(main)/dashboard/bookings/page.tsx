import { generateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next/types'
import { BookingsContent } from './bookings-content'

export const metadata: Metadata = generateMetadata({
  title: 'My Bookings',
  description: 'View and manage your class bookings',
})

export default async function BookingsPage() {
  return <BookingsContent />
}
