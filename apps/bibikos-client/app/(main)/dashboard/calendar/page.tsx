import { generateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next/types'
import { CalendarContent } from './calendar-content'

export const metadata: Metadata = generateMetadata({
  title: 'Calendar',
  description: 'View and manage your class schedules',
})

export default async function CalendarPage() {
  return <CalendarContent />
}
