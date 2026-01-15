## `@js-monorepo/schemas`

Shared **Zod schemas** and derived types for validation and type‑safe data contracts.

### Exports

From `libs/shared/schemas/src/index.ts`:

- All schemas and helper exports from `./lib/schemas`

Within `lib/schemas` you’ll find Zod schemas for:

- Auth/session
- Contact form
- Notifications
- Payments & subscriptions
- And other domain objects used across apps

### Example Usage – Validating a Payload

```ts
import { z } from 'zod'
import { contactSchema } from '@js-monorepo/schemas'

type ContactPayload = z.infer<typeof contactSchema>

function handleContact(body: unknown) {
  const payload = contactSchema.parse(body)
  // payload is now type-safe ContactPayload
}
```

### Example Usage – Sharing Types

```ts
import type { z } from 'zod'
import { subscriptionSchema } from '@js-monorepo/schemas'

export type SubscriptionDto = z.infer<typeof subscriptionSchema>
```

Use these schemas in both backend (NestJS) and frontend (Next.js) to keep validation rules and types consistent.
