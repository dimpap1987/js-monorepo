## `@js-monorepo/utils`

Small, framework‑agnostic utility functions shared across the monorepo.  
Currently focused on **date helpers** and common **error utilities**.

### Exports

From `libs/shared/utils/src/index.ts`:

- **Date utilities**
  - `date/constants` – common date/time constants (e.g. `MILLISECONDS_IN_DAY`, etc.)
  - `date.utils` – helpers for parsing, formatting, ranges, comparisons, etc.
- **Error utilities**
  - Reusable error helpers/types for consistent error handling across libs

> For exact function names, check `libs/shared/utils/src/lib/date/date.utils.ts` and `libs/shared/utils/src/lib/errors.ts`.

### Example Usage – Date Utilities

```ts
import {
  // example names – adjust to match the actual file
  startOfDay,
  endOfDay,
  isSameDay,
} from '@js-monorepo/utils'

const today = new Date()
const from = startOfDay(today)
const to = endOfDay(today)

if (isSameDay(from, to)) {
  // ...
}
```

### Example Usage – Error Helpers

```ts
import { createTypedError } from '@js-monorepo/utils'

const SubscriptionError = createTypedError('SubscriptionError')

function ensureActiveSubscription(isActive: boolean) {
  if (!isActive) {
    throw new SubscriptionError('Subscription is not active')
  }
}
```

These utilities are meant to stay **generic and reusable**.  
If you find yourself re‑implementing common date or error logic, prefer adding it here.

