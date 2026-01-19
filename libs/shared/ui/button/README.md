# DpButton

## Example

```tsx
import { DpButton } from '@js-monorepo/button'

export default function Example() {
  return <DpButton>Submit</DpButton>
}
```

## Properties

- variant?: `'primary' | 'secondary' | 'danger'` **_-- default: 'primary'_**
- size?: `'small' | 'medium' | 'large'` **_-- default: 'medium'_**
- className?: `string`
- children?: `React.ReactNode`
- loading?: `boolean` **_-- default: false_**
