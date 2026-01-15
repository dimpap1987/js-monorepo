## `@js-monorepo/ui-error`

Error boundary and error display components for React/Next.js apps.

### Exports

From `libs/shared/ui/error/src/index.ts`:

- `ErrorBoundary` – React error boundary component
- `ErrorComponent` / `ErrorView` – presentational error UI

> Implementations live in `libs/shared/ui/error/src/lib/components/`.

### Basic Usage – Error Boundary

```tsx
'use client'

import { ErrorBoundary } from '@js-monorepo/ui-error'

function Fallback() {
  return <p>Something went wrong. Please try again.</p>
}

export function SafeSection({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary fallback={<Fallback />}>{children}</ErrorBoundary>
}
```

Wrap any unstable part of the UI (heavy network components, experiments, etc.) with `ErrorBoundary` to avoid breaking the whole page.
