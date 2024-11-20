import { NotificationPermissionComponent } from '@js-monorepo/web-notification'

export default function SettingsPage() {
  return (
    <div className="p-2">
      <h1 className="text-xl sm:text-2xl font-bold ">Settings</h1>

      {/* Settings Container */}
      <div className="mt-6 space-y-8">
        {/* Push Notifications */}
        <NotificationPermissionComponent></NotificationPermissionComponent>
      </div>
    </div>
  )
}
