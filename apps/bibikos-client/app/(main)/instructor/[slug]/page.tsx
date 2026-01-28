import { generateMetadata as baseGenerateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next/types'
import { InstructorProfileContent } from './instructor-profile-content'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return baseGenerateMetadata({
    title: `Instructor Profile - ${slug}`,
    description: `Book classes with this instructor`,
  })
}

export default async function InstructorProfilePage({ params }: Props) {
  const { slug } = await params
  return <InstructorProfileContent slug={slug} />
}
