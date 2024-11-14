'use client'

import { DpButton } from '@js-monorepo/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@js-monorepo/components/tooltip'
import { useWebPushNotification } from './web-notification-provider'

const NotificationPermissionPrompt = () => {
  const { permission, requestPermission } = useWebPushNotification()

  const handleDisableNotifications = () => {
    alert(
      "Please enable notifications in your browser settings if you'd like to receive alerts."
    )
  }

  if (permission === 'granted') return

  return (
    <div className="text-center text-xs">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {permission === 'default' && (
              <DpButton size="small" onClick={requestPermission}>
                Enable Notifications
              </DpButton>
            )}
          </TooltipTrigger>
          <TooltipContent>
            Click to enable browser notifications for alerts and updates.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {permission === 'denied' && (
              <DpButton
                variant="outline"
                size="small"
                onClick={handleDisableNotifications}
              >
                Notifications are Disabled
              </DpButton>
            )}
          </TooltipTrigger>
          <TooltipContent>
            Notifications are disabled. To re-enable, change the settings in
            your browser.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

export { NotificationPermissionPrompt }
