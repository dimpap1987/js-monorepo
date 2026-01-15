## `@js-monorepo/next`

Shared **Next.js utilities** for hooks, middlewares, and providers (React Query, EventSource, WebSockets).

### Structure & Exports

Under `libs/next/src/lib/`:

- **Hooks** (`hooks/index.ts`)
  - `useDeviceType` – detect mobile/tablet/desktop
  - `usePagination` – generic pagination helper
  - `useDocumentVisible` – track document visibility
  - `useInternetStatus` – online/offline detection
  - `useDebounce` – debounced values
  - `useTimezone` – detect user timezone
- **Middlewares** (`middlewares/index.ts`)
  - `composeMiddlewares` – compose multiple Next middlewares
  - `contentSecurityPolicyMiddleware` – CSP helper
  - `withPathName` – attach pathname info
- **Providers** (`providers/index.tsx`)
  - `ReactQueryProvider` – wraps React Query config
  - `EventSourceProvider` – SSE/EventSource integration
  - `WebsocketProvider` – shared WebSocket provider

> The root `src` currently organizes exports by folder; import directly from the sub‑paths shown above.

### Example – React Query Provider

```tsx
'use client'

import { ReactQueryProvider } from '@js-monorepo/next/lib/providers'

export default function RootProviders({ children }: { children: React.ReactNode }) {
  return <ReactQueryProvider>{children}</ReactQueryProvider>
}
```

### Example – Internet Status Hook

```tsx
'use client'

import { useInternetStatus } from '@js-monorepo/next/lib/hooks'

export function OfflineBanner() {
  const isOnline = useInternetStatus()

  if (isOnline) return null

  return (
    <div className="bg-amber-500 text-sm text-black px-3 py-1 text-center">
      You are offline. Some actions may not work.
    </div>
  )
}
```

Use these helpers instead of duplicating Next‑specific plumbing in each app.
