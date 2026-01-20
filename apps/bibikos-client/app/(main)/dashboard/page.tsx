import { generateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next/types'
import { DashboardContent } from './dashboard-content'

export const metadata: Metadata = generateMetadata({
  title: 'Dashboard',
  description: 'Manage your classes, schedules, and bookings',
})

export default async function DashboardPage() {
  return <DashboardContent />
}
