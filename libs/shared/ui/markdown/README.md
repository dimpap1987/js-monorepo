# MarkdownComponent

## Example

```jsx
import { MarkdownComponent } from '@js-monorepo/markdown'
const markdownExample = `
    # Heading
    ## Sub heading
    - point
    some text
  `

export function Example() {
  return <MarkdownComponent markdownCode={markdownExample}></MarkdownComponent>
}
```

## Properties

- markdownCode: `string`
- className?: `string`
