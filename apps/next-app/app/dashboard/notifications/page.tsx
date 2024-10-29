import { NotificationSender } from './components/send-notification'

export default async function NotificationsController() {
  return (
    <>
      <div className="p-2 flex flex-col items-center justify-center">
        <h1 className="mb-4">Send Notifications</h1>
        <NotificationSender></NotificationSender>
      </div>
    </>
  )
}
