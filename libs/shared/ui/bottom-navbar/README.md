## `@js-monorepo/ui-bottom-navbar`

Mobile‑friendly bottom navigation bar for Next.js apps (ideal for dashboard/mobile layouts).

### Exports

From `libs/shared/ui/bottom-navbar/src/index.ts`:

- `BottomNavbar` and related types from:
  - `./lib/bottom-navbar`
  - `./lib/bottom-navbar-options`

### Example Usage

```tsx
'use client'

import { BottomNavbar, BottomNavbarItem } from '@js-monorepo/ui-bottom-navbar'
import { usePathname } from 'next/navigation'

const items: BottomNavbarItem[] = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/pricing', label: 'Pricing', icon: 'credit-card' },
  { href: '/settings', label: 'Settings', icon: 'cog' },
]

export function AppBottomNav() {
  const pathname = usePathname()

  return <BottomNavbar items={items} currentPath={pathname} />
}
```

The component is designed to be sticky at the bottom on smaller screens and unobtrusive on desktop.
