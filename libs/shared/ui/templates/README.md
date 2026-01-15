## `@js-monorepo/ui-templates`

High‑level page templates used across apps (e.g. admin layout, centered body container).  
Helps keep top‑level layout structure consistent.

### Exports

From `libs/shared/ui/templates/src/index.ts`:

- `AdminTemplate` – admin layout shell
- `Body` – main body/content wrapper
- `Container` – responsive width‑limited container

> Implementations live in `libs/shared/ui/templates/src/lib/`.

### Example – Admin Layout

```tsx
import { AdminTemplate } from '@js-monorepo/ui-templates'

export default function AdminPage() {
  return <AdminTemplate title="Products">{/* Admin content here */}</AdminTemplate>
}
```

Use these templates instead of hand‑rolled div stacks to keep spacing and typography consistent across screens.
