# LoaderComponent

## Example

```jsx
// example.tsx
import { LoaderComponent } from '@js-monorepo/loader'

export function Example() {
  return (
    <LoaderComponent>
      <Component></Component>
    </LoaderComponent>
  )
}
```

```jsx
// component.tsx
import { useLoader } from '@js-monorepo/loader'

export function Component() {
  const [loaderState, setLoaderState] = useLoader()

  return (
    <button onClick={() => setLoaderState({ show: true, message: 'Loading' })}>
      Trigger loading
    </button>
  )
}
```
