## `@js-monorepo/notifications-client`

React/Next.js notification components, hooks, and API helpers for the monorepo.  
Works together with `@js-monorepo/notifications-server` and WebSockets (`@js-monorepo/websockets`).

### Exports

From `libs/notifications/client/src/index.ts`:

- **Context**
  - `NotificationProvider`, `useNotificationContext`
- **Components**
  - `NotificationDropdown` – bell icon + dropdown list
  - `NotificationPage` – full notifications page layout
  - `NotificationBellButton` – trigger button
  - `NotificationReadAllButton` – mark all as read
  - `NotificationEmptyState` – empty state UI
  - `NotificationItem` – single notification row
  - `NotificationList` – virtualized list of notifications
  - `NotificationListProps` – type for the list
- **Hooks**
  - `useNotificationWebSocket` – subscribe to real‑time notification events
  - React Query hooks:
    - `useReadAllNotifications`
    - `useReadNotification`
    - `useUserNotifications`
    - `useUserNotificationsByCursor`
- **Utils**
  - `apiFetchUserNotifications`
  - `apiReadAllNotifications`
  - `apiReadNotification`
  - `humanatizeNotificationDate`
  - `updateNotificationAsRead`

### Basic Setup (App Provider)

```tsx
// apps/bibikos-client/app/(main)/layout.tsx
'use client'

import { NotificationProvider } from '@js-monorepo/notifications-client'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <NotificationProvider>{children}</NotificationProvider>
}
```

Make sure your React Query provider and auth/session providers are configured at a higher level.

### Notification Bell in App Shell

```tsx
import {
  NotificationDropdown,
  NotificationBellButton,
  NotificationReadAllButton,
} from '@js-monorepo/notifications-client'

export function AppHeader() {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b">
      <div className="font-semibold">Bibikos App</div>
      <NotificationDropdown trigger={<NotificationBellButton />} footer={<NotificationReadAllButton />} />
    </header>
  )
}
```

The dropdown automatically uses the underlying hooks to fetch and paginate notifications.

### Full Notifications Page

```tsx
// apps/bibikos-client/app/(main)/notifications/page.tsx
'use client'

import { NotificationPage } from '@js-monorepo/notifications-client'

export default function NotificationsRoute() {
  return <NotificationPage />
}
```

### Real‑Time Updates (WebSocket)

```tsx
import { useEffect } from 'react'
import { useNotificationWebSocket } from '@js-monorepo/notifications-client'

export function NotificationsWebSocketBridge() {
  const { connect, disconnect } = useNotificationWebSocket()

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return null
}
```

Place this component inside your authenticated app shell so notifications update as they arrive from the server.
