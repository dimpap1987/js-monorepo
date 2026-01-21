import { generateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next/types'
import MyBookingsComponent from './my-bookings'

export const metadata: Metadata = generateMetadata({
  title: 'My Bookings',
  description: 'Check your bookings',
})

export default async function MyBookingsPage() {
  return <MyBookingsComponent />
}
