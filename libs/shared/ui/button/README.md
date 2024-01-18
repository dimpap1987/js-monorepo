# DpButton

## Example

```tsx
import { DpButton } from '@js-monorepo/button'

export default function Example() {
  return <DpButton>Submit</DpButton>
}
```

## Properties

- variant?: `'primary' | 'secondary' | 'danger'` ***-- default: 'primary'***
- size?: `'small' | 'medium' | 'large'` ***-- default: 'medium'***
- className?: `string`
- children?: `React.ReactNode`
- loading?: `boolean` ***-- default: false***
