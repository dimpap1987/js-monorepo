import { NotificationPermissionComponent } from '@js-monorepo/web-notification'
import { BackArrowWithLabel } from '@js-monorepo/back-arrow'

export default function SettingsPage() {
  return (
    <div className="p-2">
      <BackArrowWithLabel>
        <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
          Settings
        </h1>
      </BackArrowWithLabel>

      {/* Settings Container */}
      <div className="mt-6 space-y-8">
        {/* Push Notifications */}
        <NotificationPermissionComponent></NotificationPermissionComponent>
      </div>
    </div>
  )
}
