import { NotificationPage } from './notication-page'
import { DynamicHeightTemplate } from '@js-monorepo/templates'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notifications',
}

export default function Notifications() {
  return (
    <DynamicHeightTemplate>
      <NotificationPage></NotificationPage>
    </DynamicHeightTemplate>
  )
}
