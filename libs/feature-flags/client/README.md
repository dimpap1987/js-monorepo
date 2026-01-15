# Feature Flags – Client Library (`@js-monorepo/feature-flags-client`)

Client-side utilities for **reading and gating on feature flags** in `gym-client` and other Next.js apps.

This library is designed to work with the server-side feature flag service (`@js-monorepo/feature-flags-server`) but can be used with any backend that returns a `Record<string, boolean>` map of flags.

---

## Overview

The client package provides:

- `FeatureFlagsProvider` – React context provider that takes a `{ [key: string]: boolean }` map of flags.
- `useFeatureFlag(key)` – hook that returns a boolean for a given flag key.
- `useFeatureFlags()` – hook returning the entire flags map.
- `FeatureGate` – simple component to conditionally render children when a flag is enabled.

All exports are available from the root:

```ts
import { FeatureFlagsProvider, useFeatureFlag, FeatureGate } from '@js-monorepo/feature-flags-client'
```

---

## Wiring in `gym-client`

### 1. Ensure path alias

`tsconfig.base.json` should already include:

```jsonc
"paths": {
  // ...
  "@js-monorepo/feature-flags-client": ["libs/feature-flags/client/src/index.ts"]
}
```

### 2. Provide flags at the app root

Typically you’ll attach a `featureFlags` map to the authenticated session on the server (e.g. in `gym-api`), then read it in `gym-client` and pass it into the provider.

Example using `useSession` in `RootComponent`:

```tsx
// apps/gym-client/components/root-component.tsx
'use client'

import { FeatureFlagsProvider } from '@js-monorepo/feature-flags-client'
import { useSession } from '@js-monorepo/auth/next/client'

export default function RootComponent({ children }: React.PropsWithChildren) {
  const { session, isLoggedIn, isAdmin, refreshSession } = useSession()

  // Expecting something like: session.featureFlags = { 'home.featureShowcase': true, 'pricing.v2': false }
  const flags = (session?.featureFlags ?? {}) as Record<string, boolean>

  // ...existing hooks (websocket, offline indicator, etc.)

  return (
    <FeatureFlagsProvider flags={flags}>
      {/* existing layout (Navbar, Sidebar, etc.) */}
      {children}
    </FeatureFlagsProvider>
  )
}
```

> If you don’t yet populate `session.featureFlags` from the backend, you can temporarily hard-code a map here for local testing.

---

## Using feature flags in components

### 1. `useFeatureFlag`

Use the hook when you want to branch logic in code:

```tsx
import { useFeatureFlag } from '@js-monorepo/feature-flags-client'

export function PricingSection() {
  const isNewPricing = useFeatureFlag('pricing.v2')

  if (isNewlyPricing) {
    return <NewPricing />
  }

  return <LegacyPricing />
}
```

### 2. `FeatureGate` component

Use the component when you want to conditionally render a subtree:

```tsx
import { FeatureGate } from '@js-monorepo/feature-flags-client'

export function HomePage() {
  return (
    <>
      {/* Always visible content */}
      <Hero />

      {/* Only show this if the flag is ON */}
      <FeatureGate flag="home.featureShowcase">
        <PremiumFeatureShowcase />
      </FeatureGate>

      {/* With a fallback */}
      <FeatureGate flag="pricing.v2" fallback={<LegacyPricing />}>
        <NewPricing />
      </FeatureGate>
    </>
  )
}
```

### 3. Reading the full map

If you need to inspect all flags (e.g., for debugging or to render a list):

```tsx
import { useFeatureFlags } from '@js-monorepo/feature-flags-client'

export function DebugFlags() {
  const flags = useFeatureFlags()
  return <pre className="text-xs bg-black text-green-400 p-2 rounded">{JSON.stringify(flags, null, 2)}</pre>
}
```

---

## Example end-to-end flag
