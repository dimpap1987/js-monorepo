## `@js-monorepo/ui-back-arrow`

Small navigation helper component that renders a **back arrow label/button** for Next.js apps.

### Exports

From `libs/shared/ui/back-arrow/src/index.ts`:

- `BackArrowLabel` (and/or related back arrow components) from `./lib/back-arrow-label`

### Example Usage

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { BackArrowLabel } from '@js-monorepo/ui-back-arrow'

export function BackToSettings() {
  const router = useRouter()

  return <BackArrowLabel onClick={() => router.back()}>Back to settings</BackArrowLabel>
}
```

Ideal for consistent back navigation in nested settings or detail pages.
