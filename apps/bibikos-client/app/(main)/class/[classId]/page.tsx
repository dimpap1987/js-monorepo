import { generateMetadata as baseGenerateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next/types'
import { ClassDetailContent } from './class-detail-content'

type Props = {
  params: Promise<{ classId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { classId } = await params
  return baseGenerateMetadata({
    title: `Class Details`,
    description: `View class details and book sessions`,
  })
}

export default async function ClassDetailPage({ params }: Props) {
  const { classId } = await params
  const id = parseInt(classId, 10)

  if (isNaN(id)) {
    return <ClassDetailContent classId={0} />
  }

  return <ClassDetailContent classId={id} />
}
