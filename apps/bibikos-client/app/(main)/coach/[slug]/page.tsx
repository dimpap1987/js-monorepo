import { generateMetadata as baseGenerateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next/types'
import { CoachProfileContent } from './coach-profile-content'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return baseGenerateMetadata({
    title: `Coach Profile`,
    description: `Book classes with this instructor`,
  })
}

export default async function CoachProfilePage({ params }: Props) {
  const { slug } = await params
  return <CoachProfileContent slug={slug} />
}
