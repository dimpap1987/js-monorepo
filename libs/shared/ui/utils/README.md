## `@js-monorepo/ui-utils`

Small UI‑focused helpers for React/Next.js components, mainly:

- **`cn`** – Tailwind‑aware `className` utility using `tailwind-merge`
- **`constructURIQueryString`** – helper for building query strings from search params

### Exports

From `libs/shared/ui/utils/src/index.ts`:

- `cn(...classNames: ClassValue[]): string`
- `constructURIQueryString(searchParams: URLSearchParams | Record<string, any>): string`

### `cn` – Class Name Helper

```tsx
import { cn } from '@js-monorepo/ui-utils'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    />
  )
}
```

`cn`:

- Flattens nested arrays of class names
- Filters out `undefined | null | false`
- Merges Tailwind classes intelligently (e.g. `p-2 p-4` → `p-4`)

### `constructURIQueryString` – Query String Builder

```ts
import { constructURIQueryString } from '@js-monorepo/ui-utils'

const query = constructURIQueryString({
  pageIndex: 2, // will be mapped to `page`
  search: 'gym classes',
  sort: 'price',
})

// query === '?page=2&search=gym%20classes&sort=price'
```

Notes:

- Accepts either a `URLSearchParams` instance or a plain object
- Automatically renames `pageIndex` → `page` in the resulting query string
- URL‑encodes keys and values

