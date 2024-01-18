# DpMarkdown

## Example

```jsx
import { DpMarkdown } from '@js-monorepo/markdown'
const markdownExample = `
    # Heading
    ## Sub heading
    - point
    some text
  `

export function Example() {
  return <DpMarkdown markdownCode={markdownExample}></DpMarkdown>
}
```

## Properties

- markdownCode: `string`
- className?: `string`
