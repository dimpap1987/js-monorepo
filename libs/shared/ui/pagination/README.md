## `@js-monorepo/ui-pagination`

Reusable pagination UI components for lists and tables.

### Exports

From `libs/shared/ui/pagination/src/index.ts`:

- Pagination components from `./lib/pagination` (pager, page buttons, next/prev, etc.)

### Example Usage

```tsx
'use client'

import { Pagination } from '@js-monorepo/ui-pagination'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'

export function TablePagination({ totalPages }: { totalPages: number }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const page = Number(searchParams.get('page') ?? '1')

  const onPageChange = (nextPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(nextPage))
    router.push(`${pathname}?${params.toString()}`)
  }

  return <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
}
```

Use together with `@js-monorepo/ui-utils.constructURIQueryString` for consistent query string handling.
