import { NotificationsPage } from '@js-monorepo/notifications-client'
import { DynamicHeightTemplate } from '@js-monorepo/templates'
import { websocketOptions } from '@next-app/utils/websocket.config'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notifications',
}

export default function Notifications() {
  return (
    <DynamicHeightTemplate>
      <NotificationsPage
        websocketOptions={websocketOptions}
      ></NotificationsPage>
    </DynamicHeightTemplate>
  )
}
