# DpLoaderProvider

## Example

```jsx
// example.tsx
import { DpLoaderProvider } from '@js-monorepo/loader'

export function Example() {
  return (
    <DpLoaderProvider>
      <Component></Component>
    </DpLoaderProvider>
  )
}
```

```jsx
// component.tsx
import { useLoader } from '@js-monorepo/loader'

export function Component() {
  const [loaderState, setLoaderState] = useLoader()

  return <button onClick={() => setLoaderState({ show: true, message: 'Loading' })}>Trigger loading</button>
}
```
