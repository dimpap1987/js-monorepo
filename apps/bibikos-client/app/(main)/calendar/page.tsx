import { getCurrentSession } from '@js-monorepo/auth/next/server'
import { generateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next/types'
import { redirect } from 'next/navigation'
import { CalendarContent } from './calendar-content'

export const metadata: Metadata = generateMetadata({
  title: 'Calendar',
  description: 'View and manage your class schedules',
})

export default async function CalendarPage() {
  const session = await getCurrentSession()

  if (!session?.user) {
    redirect('/auth/login')
  }

  return <CalendarContent />
}
