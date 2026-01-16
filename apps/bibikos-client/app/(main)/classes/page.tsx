import { getCurrentSession } from '@js-monorepo/auth/next/server'
import { generateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next/types'
import { redirect } from 'next/navigation'
import { ClassesContent } from './classes-content'

export const metadata: Metadata = generateMetadata({
  title: 'Classes',
  description: 'Manage your class templates',
})

export default async function ClassesPage() {
  const session = await getCurrentSession()

  if (!session?.user) {
    redirect('/auth/login')
  }

  return <ClassesContent />
}
