## `@js-monorepo/ui-components`

Shared, composable UI building blocks (tables, cards, layout pieces, etc.) used across Next.js apps in the monorepo.  
Built on top of Tailwind and shadcn‑style primitives.

### Exports

From `libs/shared/ui/components/src/index.ts` (see file for full list):

- Table primitives (e.g. `Table`, `TableHeader`, `TableRow`, ...)
- Common layout components
- Reusable form and display components

> The exact exported component list lives in `libs/shared/ui/components/src/lib/`.

### Example – Table

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@js-monorepo/ui-components'

export function UsersTable({ users }: { users: { id: number; name: string }[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell>{user.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

Use these components rather than hand‑rolling tables/layouts to keep styling and behavior consistent.
