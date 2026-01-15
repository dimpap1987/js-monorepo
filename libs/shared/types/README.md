## `@js-monorepo/types`

Shared TypeScript types for the entire monorepo.  
Keeps contracts between frontend, backend, and shared libs aligned.

### Structure

From `libs/shared/types/src/lib/`:

- `auth` – authentication/session types
- `checkout` – checkout & Stripe‑related types
- `contact` – contact form payloads
- `feature-flags` – feature flag definitions
- `json` – generic JSON helper types
- `menu` – navigation/menu item types
- `notifications` – notification payloads
- `pagination` – pagination request/response shapes
- `pricing` – plan & pricing types
- `responses` – generic API response envelopes (`ClientResponseType`, etc.)
- `shared` – cross‑cutting shared types
- `subscription` – subscription contracts
- `user-profile` – profile data
- `websocket` – websocket message and presence types

Each folder has an `index.ts` that re‑exports its public types; the root `src/index.ts` re‑exports them for the package.

### Example Usage

```ts
import type { ClientResponseType } from '@js-monorepo/types/responses'
import type { SubscriptionStatus } from '@js-monorepo/types/subscription'

async function fetchSubscription(): Promise<ClientResponseType<{ status: SubscriptionStatus }>> {
  // ...
}
```

Always import from `@js-monorepo/types/*` instead of re‑declaring shapes in each app.
