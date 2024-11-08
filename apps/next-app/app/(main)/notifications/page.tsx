import { Metadata } from 'next'
import { NotificationList } from './components/notificationList'

export const metadata: Metadata = {
  title: 'Notifications',
}

export default function Notifications() {
  return (
    <section className="space-y-2">
      <NotificationList></NotificationList>
    </section>
  )
}
