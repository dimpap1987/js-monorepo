import { NotificationSender } from './components/send-notification'

export default async function NotificationsController() {
  return (
    <>
      <div className="p-2 flex flex-col items-center justify-center">
        <h1 className="mb-4">Notifications Dashboard</h1>
        <NotificationSender></NotificationSender>
      </div>
    </>
  )
}
