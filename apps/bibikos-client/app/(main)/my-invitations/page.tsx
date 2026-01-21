import { generateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next/types'
import MyInvitationsComponent from './my-invitations'

export const metadata: Metadata = generateMetadata({
  title: 'My Invitations',
  description: 'Check yoour invitations',
})

export default async function MyInvitationsPage() {
  return <MyInvitationsComponent />
}
