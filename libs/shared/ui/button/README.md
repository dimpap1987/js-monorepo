# ButtonComponent

## Example

```tsx
import { ButtonComponent } from '@js-monorepo/button'

export default function Example() {
  return <ButtonComponent>Submit</ButtonComponent>
}
```

## Properties

- variant?: `'primary' | 'secondary' | 'danger'` ***-- default: 'primary'***
- size?: `'small' | 'medium' | 'large'` ***-- default: 'medium'***
- className?: `string`
- children?: `React.ReactNode`
- loading?: `boolean` ***-- default: false***
