import { NotificationPage } from './notication-page'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notifications',
}

export default function Notifications() {
  return <NotificationPage></NotificationPage>
}
