import { NotificationsPage } from '@js-monorepo/notifications-ui'
import { DynamicHeightTemplate } from '@js-monorepo/templates'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notifications',
}

export default function Notifications() {
  return (
    <DynamicHeightTemplate>
      <NotificationsPage></NotificationsPage>
    </DynamicHeightTemplate>
  )
}
