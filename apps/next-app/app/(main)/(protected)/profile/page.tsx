import { ContainerTemplate } from '@js-monorepo/templates'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My profile',
}

export default function Profile() {
  return (
    <ContainerTemplate>
      <div>My profile</div>
    </ContainerTemplate>
  )
}
