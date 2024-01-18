<h1 style="display:inline"> DpNextPageProgressBar </h1> <sub>a nextjs library</sub>

## Example

```jsx
import { DpNextPageProgressBar } from '@js-monorepo/page-progress-bar'

export function Example() {
  return <DpNextPageProgressBar color="red">{children}</DpNextPageProgressBar>
}
```

**_IMPORTANT_**  
If you want to use `<DpNextNavLink>`, then you must use `<DpNextPageProgressBar>`


## Properties

- children: `React.ReactNode`
- color?: `string`
- height?: `string`
- options?: `Partial<NProgressOptions>`
- shallowRouting?: `boolean`
- delay?: `number`
- style?: `string`
