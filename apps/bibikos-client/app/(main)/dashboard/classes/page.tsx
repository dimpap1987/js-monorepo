import { generateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next/types'
import { ClassesContent } from './classes-content'

export const metadata: Metadata = generateMetadata({
  title: 'Classes',
  description: 'Manage your class templates',
})

export default async function ClassesPage() {
  return <ClassesContent />
}
