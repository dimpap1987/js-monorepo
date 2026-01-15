## `@js-monorepo/ui-theme-provider`

Dark/light theme provider, toggler, and theme definitions for the monorepo UI.

### Exports

From `libs/shared/ui/theme-provider/src/index.ts`:

- `ThemeProvider` – context provider for theme state
- `ThemeToggler` – UI control to switch themes
- `themes` / theme config – shared theme tokens

> Implementations live in `libs/shared/ui/theme-provider/src/lib/`.

### Basic Setup

```tsx
'use client'

import { ThemeProvider } from '@js-monorepo/ui-theme-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

### Toggling Theme

```tsx
import { ThemeToggler } from '@js-monorepo/ui-theme-provider'

export function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggler />
    </div>
  )
}
```

Use this library anywhere you need consistent theming behavior across apps.
