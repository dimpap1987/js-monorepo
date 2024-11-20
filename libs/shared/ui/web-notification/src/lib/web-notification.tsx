'use client'

import { useWebPushNotification } from './web-notification-provider'

const NotificationPermissionComponent = () => {
  const { permission, requestPermission } = useWebPushNotification()

  const handleDisableNotifications = () => {
    alert(
      "Please enable Push Notifications in your browser settings if you'd like to receive alerts."
    )
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
      label:
        'Push Notifications are disabled. To re-enable, change the browser settings.',
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
    <section className="bg-white shadow rounded-lg p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
        Push Notifications
      </h2>
      <p className="text-xs sm:text-sm text-gray-600 mt-1 flex gap-1 flex-wrap">
        <span>Control how you receive </span> <span>push notifications.</span>
      </p>
      <div className="mt-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-5 w-5 border-gray-300 rounded focus:ring-blue-500 checked:bg-blue-600 shrink-0 hover:cursor-pointer focus:outline-none"
            aria-label={label}
            {...checkboxProps}
          />
          <span className="ml-3 text-gray-700 text-sm">{label}</span>
        </label>
      </div>
    </section>
  )
}

export { NotificationPermissionComponent }
