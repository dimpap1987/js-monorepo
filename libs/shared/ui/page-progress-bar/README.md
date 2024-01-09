# PageProgressBar

## Example

```jsx
import { PageProgressBar } from '@js-monorepo/page-progress-bar'

export function Example() {
  return <PageProgressBar color="red">{children}</PageProgressBar>
}
```

**_IMPORTANT_**  
If you want to use `<NavLink>`, then you must use `<PageProgressBar>`


## Properties

- children: `React.ReactNode`
- color?: `string`
- height?: `string`
- options?: `Partial<NProgressOptions>`
- shallowRouting?: `boolean`
- delay?: `number`
- style?: `string`
