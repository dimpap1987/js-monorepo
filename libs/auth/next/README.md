## `@js-monorepo/auth-next`

Next.js‑specific auth helpers for the monorepo.  
Provides a client‑side `AuthClient` for OAuth flows and server‑side helpers for reading the current session from `my-api`.

### Structure

Under `libs/auth/next/src/lib/`:

- **Client** (`client/index.ts`)
  - `AuthClient` class
  - `authClient` singleton
  - `buildLoginUrl`
  - `session` helpers/components
- **Server** (`server/index.ts`)
  - `createCookieHeaders`
  - `getCurrentSession`
  - `findUnregisteredUser`

### Client‑Side Usage

```tsx
'use client'

import { authClient, buildLoginUrl } from '@js-monorepo/auth-next/lib/client'

export function LoginButtons() {
  return (
    <div className="flex gap-2">
      <button onClick={() => authClient.login('google', '/dashboard')}>Login with Google</button>
      <button onClick={() => authClient.login('github', '/dashboard')}>Login with GitHub</button>
    </div>
  )
}

export function LogoutButton() {
  return <button onClick={() => authClient.logout()}>Logout</button>
}
```

The client automatically derives the base URL from:

- explicit `authUrl` constructor argument, or
- `window.location.origin` in the browser, or
- `NEXT_PUBLIC_APP_URL` on the server.

### Server‑Side Usage (Session in Next.js)

```ts
// apps/next-app/app/@auth/session.ts
import { getCurrentSession } from '@js-monorepo/auth-next/lib/server'

export async function getServerSession() {
  return getCurrentSession()
}
```

Requirements:

- `INTERNAL_API_URL` must point to the internal URL of `my-api`
- Optionally `APP_URL` to set `Origin`/`Referer` headers

### Finding Unregistered Users

```ts
import { findUnregisteredUser } from '@js-monorepo/auth-next/lib/server'

export async function loadUnregisteredUser() {
  const user = await findUnregisteredUser()
  return user
}
```

This is used during onboarding to complete registration for OAuth users who have not yet chosen a username.
