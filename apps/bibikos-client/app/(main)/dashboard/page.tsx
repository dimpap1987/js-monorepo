import { getCurrentSession } from '@js-monorepo/auth/next/server'
import { generateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next/types'
import { redirect } from 'next/navigation'
import { DashboardContent } from './dashboard-content'

export const metadata: Metadata = generateMetadata({
  title: 'Dashboard',
  description: 'Manage your classes, schedules, and bookings',
})

export default async function DashboardPage() {
  const session = await getCurrentSession()

  if (!session?.user) {
    redirect('/auth/login')
  }

  return <DashboardContent />
}
