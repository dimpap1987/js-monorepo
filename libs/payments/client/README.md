## `@js-monorepo/payments-ui` (client)

React/Next.js components and hooks for **plans, pricing, checkout, and subscription management**.  
Built on top of the payments API exposed by `@js-monorepo/payments-server`.

> **Price & Locale Rule**  
> Each Stripe product has distinct prices for **EUR** and **USD**.
>
> - Users with `el` locale → see **EUR** prices and are charged in EUR.
> - Users with `en` locale → see **USD** prices and are charged in USD.  
>   Always pass the correct currency/locale to queries and components so the displayed price matches the Stripe price used at checkout.

### Exports Overview

From `libs/payments/client/src/index.ts`:

- **User‑facing components**
  - `Checkout` – checkout button / flow
  - `Invoices` – list of invoices
  - `PlanBadge` – small badge for plan level
  - `PlanGate` – gate UI that hides/protects content based on plan/subscription
  - `Pricing` – pricing tables
  - `Subscription` – subscription status and actions (cancel, renew, etc.)
- **React Query hooks**
  - `useGetSubscription`, `useGetInvoices`, `useHasSubscriptionHistory`, etc. (see `payments-queries.ts`)
  - Admin: `useAdminProducts`, `useAdminProduct`, etc. (from `admin-products-queries.ts`)
- **API helpers**
  - `apiAssignTrial`, `apiCancelSubscription`, `apiCreatePortalSession`, `apiExtendTrial`, `apiGetInvoices`, `apiGetSubscription`, `apiHasSubscriptionHistory`, `apiRenewSubscription`, `generateIdempotencyKey`
  - Admin: `adminApi*` helpers for managing products and prices
- **Types & constants**
  - Shared types for plans, subscriptions, invoices, products, and constants for intervals, statuses, etc.

### Basic Setup (Next.js)

Typically used inside a Next.js app with React Query and your auth/session context:

```tsx
// apps/bibikos-client/app/(main)/settings/subscription/subscription-settings.tsx
'use client'

import { Subscription } from '@js-monorepo/payments-ui'

export default function SubscriptionSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Subscription</h1>
      <Subscription />
    </div>
  )
}
```

Ensure:

- The user is authenticated and your API routes (from `@js-monorepo/payments-server`) are available.
- React Query provider is configured (see `libs/next` for shared providers).

### Pricing With Locale‑Aware Currency

```tsx
import { Pricing } from '@js-monorepo/payments-ui'
import { useLocale } from 'next-intl' // or your locale hook

export function PricingSection() {
  const locale = useLocale()
  const currency = locale === 'el' ? 'EUR' : 'USD'

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Plans</h2>
      <Pricing currency={currency} />
    </section>
  )
}
```

Make sure your backend products have matching EUR and USD prices so that:

- The **plan cards** show the correct currency and amount
- The **Stripe checkout session** created by your API uses the same price ID

### Using the Query + API Helpers

```tsx
import { useHasSubscriptionHistory, apiCreatePortalSession } from '@js-monorepo/payments-ui'

export function BillingActions() {
  const { data } = useHasSubscriptionHistory()
  const hasHistory = !!data?.hasHistory

  const openPortal = async () => {
    const { url } = await apiCreatePortalSession()
    if (url) window.location.href = url
  }

  if (!hasHistory) return null

  return (
    <button onClick={openPortal} className="btn-primary">
      Manage billing
    </button>
  )
}
```

### Admin Products Management UI

The admin section (e.g. `apps/bibikos-client/app/(admin)/admin/products`) uses:

- `AdminProductsTable`, dialogs, etc. from `./lib/components/admin`
- `useAdminProducts` & related hooks from `admin-products-queries`
- `adminApi*` utilities from `utils/admin-api`

Responsibilities:

- Create/update products with **multiple prices** (EUR/USD × monthly/yearly)
- Control which products are visible and how they’re described in the UI
- Ensure price IDs and currencies align with the backend expectations
