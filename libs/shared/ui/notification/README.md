# DpNotificationProvider

## Example

```jsx
// example.tsx
import { DpNotificationProvider } from '@js-monorepo/notification'

export function Example() {
  return (
    <DpNotificationProvider>
      <Component></Component>
    </DpNotificationProvider>
  )
}
```

```jsx
// component.tsx
import { useNotifications } from '@js-monorepo/notification'

export function Component() {
  const [addNotification] = useNotifications()
  return (
    <button
      onClick={() =>
        addNotification({
          message: 'Something went wrong',
          description: 'Please try again later...',
          type: 'error',
          duration: 4000,
        })
      }
    >
      Submit
    </button>
  )
}
```

> addNotification: (notification: NotificationType) => void

NotificationType

- id?: `number`
- type: `'success' | 'error' | 'spinner'`
- message: `string`
- description?: `string`
- duration?: `number`
