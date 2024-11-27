import { Metadata } from 'next'
import { NotificationList } from './components/notificationList'

export const metadata: Metadata = {
  title: 'Notifications',
}

export default function Notifications() {
  return (
    <section className="space-y-2 sm:max-w-6xl mx-auto h-[78svh] sm:h-[calc(100svh_-_var(--navbar-height)_-_30px_-_23px)] ">
      <NotificationList></NotificationList>
    </section>
  )
}
