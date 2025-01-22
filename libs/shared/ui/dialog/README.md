# DpDialog

## Example

```jsx
import { DpDialog, DpDialogHeader, DpDialogContent, DpDialogFooter } from '@js-monorepo/dialog'

export default function Example() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DpDialog isOpen={isOpen} onClose={setIsOpen(false)}>
      <DpDialogHeader>**Your Header**</DpDialogHeader>
      <DpDialogContent>**Your content**</DpDialogContent>
      <DpDialogFooter>**Your Footer**</DpDialogFooter>
    </DpDialog>
  )
}
```

## Properties

- isOpen?: `boolean` **_--- default: true_**
- onClose: () => `void`
- children: `React.ReactNode`
- className?: `string`

# DpLoginDialog

## Example

```jsx
import { DpLoginDialog } from '@js-monorepo/dialog'

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
    <DpLoginDialog
      socialConfig={socialLogin}
      isOpen={isLoginDialog}
      onClose={() => setIsLoginDialog(false)}
    ></DpLoginDialog>
  )
}
```

## Properties

- isOpen?: `boolean` **_--- default: true_**
- onClose: () => `void`
- socialConfig: `SocialConfig[]`

# DpConfirmationDialog

## Example

```jsx
export default function Example() {
  const [isOpenDialog, setOpenDialog] = useState(false)

  return (
    <DpConfirmationDialog
      isOpen={isOpenDialog}
      onClose={() => setOpenDialog(false)}
      onCancel={() => setOpenDialog(false)}
      onConfirm={async () => setOpenDialog(false)}
    ></DpConfirmationDialog>
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
