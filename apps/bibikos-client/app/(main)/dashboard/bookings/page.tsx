import { generateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next/types'
import { BookingsContent } from './bookings-content'

export const metadata: Metadata = generateMetadata({
  title: 'Class Bookings',
  description: 'View and manage bookings for your classes',
})

export default async function BookingsPage() {
  return <BookingsContent />
}
