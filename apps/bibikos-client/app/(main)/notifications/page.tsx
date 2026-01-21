import { NotificationPage as NotificationPageComponent } from '@js-monorepo/notifications-ui'
import { generateMetadata } from '@js-monorepo/seo'
import { ContainerTemplate } from '@js-monorepo/templates'
import { Metadata } from 'next'

export const metadata: Metadata = generateMetadata({
  title: 'Notifications',
})

export default function Notifications() {
  return (
    <ContainerTemplate>
      <NotificationPageComponent />
    </ContainerTemplate>
  )
}
