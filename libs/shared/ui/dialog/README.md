# DialogComponent

## Example

```jsx
import {
  DialogComponent,
  DialogHeader,
  DialogContent,
  DialogFooter,
} from '@js-monorepo/dialog'

export default function Example() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DialogComponent isOpen={isOpen} onClose={setIsOpen(false)}>
      <DialogHeader>**Your Header**</DialogHeader>
      <DialogContent>**Your content**</DialogContent>
      <DialogFooter>**Your Footer**</DialogFooter>
    </DialogComponent>
  )
}
```

## Properties

- isOpen?: `boolean` **_--- default: true_**
- onClose: () => `void`
- children: `React.ReactNode`
- className?: `string`

# LoginDialogComponent

## Example

```jsx
import { LoginDialogComponent } from '@js-monorepo/dialog'

const socialLogin: SocialConfig[] = [
  {
    type: 'github',
    onLogin: () => {},
  },
  {
    type: 'google',
    onLogin: () => {},
  },
  {
    type: 'facebook',
    onLogin: () => {},
  },
]
export default function Example() {
  const [isLoginDialog, setIsLoginDialog] = useState(false)

  return (
    <LoginDialogComponent
      socialConfig={socialLogin}
      isOpen={isLoginDialog}
      onClose={() => setIsLoginDialog(false)}
    ></LoginDialogComponent>
  )
}
```

## Properties

- isOpen?: `boolean` **_--- default: true_**
- onClose: () => `void`
- socialConfig: `SocialConfig[]`

# ConfirmationDialogComponent

## Example

```jsx
export default function Example() {
  const [isOpenDialog, setOpenDialog] = useState(false)

  return (
    <ConfirmationDialogComponent
      isOpen={isOpenDialog}
      onClose={() => setOpenDialog(false)}
      onCancel={() => setOpenDialog(false)}
      onConfirm={async () => setOpenDialog(false)}
    ></ConfirmationDialogComponent>
  )
}
```

## Properties

- className?: `string`
- isOpen: `boolean`
- onClose: () => `void`
- title?: `string` // Header content
- content?: `string | ReactNode` // Main content
- confirmLabel?: `string` // Confirm button label
- onConfirm?: () => `void` // Confirm button action
- cancelLabel?: `string` // Cancel button label
- onCancel?: () => `void` // Cancel button action
