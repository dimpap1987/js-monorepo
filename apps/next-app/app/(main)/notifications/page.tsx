import { Metadata } from 'next'
import { NotificationList } from './components/notificationList'
import { DynamicHeightTemplate } from '@js-monorepo/templates'

export const metadata: Metadata = {
  title: 'Notifications',
}

export default function Notifications() {
  return (
    <DynamicHeightTemplate>
      <NotificationList></NotificationList>
    </DynamicHeightTemplate>
  )
}
