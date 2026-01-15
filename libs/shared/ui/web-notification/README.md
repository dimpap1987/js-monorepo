## `@js-monorepo/ui-web-notification`

Wrapper around the **Web Notifications API** with React‑friendly helpers.

### Exports

From `libs/shared/ui/web-notification/src/index.ts`:

- Utilities from `./lib/utils`
- `WebNotificationProvider` and related hooks from `./lib/web-notification-provider`

### Example Usage

```tsx
'use client'

import { WebNotificationProvider, useWebNotification } from '@js-monorepo/ui-web-notification'

export function AppWithWebNotifications({ children }: { children: React.ReactNode }) {
  return <WebNotificationProvider>{children}</WebNotificationProvider>
}

export function NotifyButton() {
  const { requestPermissionAndNotify } = useWebNotification()

  return (
    <button
      onClick={() =>
        requestPermissionAndNotify({
          title: 'Workout reminder',
          body: 'Time for your session at the gym.',
        })
      }
    >
      Enable reminders
    </button>
  )
}
```

Use together with server‑side notifications (`@js-monorepo/notifications-*`) to provide richer UX when the tab is not focused.
