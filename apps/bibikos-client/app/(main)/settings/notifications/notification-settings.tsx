'use client'

import { useWebPushNotification } from '@js-monorepo/web-notification'
import { SettingsItem } from '../settings-items'
import { BackArrowWithLabel } from '@js-monorepo/back-arrow'

const NotificationPermissionComponent = () => {
  const { permission, requestPermission } = useWebPushNotification()

  const handleDisableNotifications = () => {
    alert("Please enable Push Notifications in your browser settings if you'd like to receive alerts.")
  }

  const permissionStates = {
    default: {
      label: 'Enable Push notifications for alerts and updates.',
      checkboxProps: {
        onClick: requestPermission,
        checked: permission === 'granted',
        onChange: () => {},
      },
    },
    denied: {
      label: 'Push Notifications are disabled. To re-enable, change the browser settings.',
      checkboxProps: {
        onClick: handleDisableNotifications,
        readOnly: true,
        checked: false,
      },
    },
    granted: {
      label: 'Push Notifications are enabled.',
      checkboxProps: {
        checked: true,
        readOnly: true,
      },
    },
  }

  const { label, checkboxProps } = permissionStates[permission] || {
    label: 'Permission state unknown.',
    checkboxProps: { disabled: true },
  }

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <BackArrowWithLabel>
        <h2 className="mb-2">Notification Settings</h2>
        <p className="text-sm text-foreground-muted">Control how you receive notifications</p>
      </BackArrowWithLabel>

      <SettingsItem label="Push Notifications">
        <p className="text-xs font-semibold sm:text-sm mt-1 flex gap-1 flex-wrap">
          <span>Control how you receive </span> <span>push notifications.</span>
        </p>
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-5 w-5 border-border rounded focus:ring-blue-500 checked:bg-blue-600 shrink-0 hover:cursor-pointer focus:outline-none"
              aria-label={label}
              {...checkboxProps}
            />
            <span className="ml-3 text-foreground text-sm">{label}</span>
          </label>
        </div>
      </SettingsItem>
    </section>
  )
}

export { NotificationPermissionComponent }
