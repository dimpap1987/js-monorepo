# EmbeddedCheckoutComponentDialog

## Example

```jsx
import { EmbeddedCheckoutComponentDialog } from '@js-monorepo/payment'
import { checkoutSessionClient } from '@js-monorepo/utils'

export function Example() {
  const [isOpenCheckoutDialog, setOpenCheckoutDialog] = useState(false)

  return (
    <EmbeddedCheckoutComponentDialog
      stripePublishableKey={
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
      }
      isOpen={isOpenCheckoutDialog}
      onClose={() => setOpenCheckoutDialog(false)}
      checkOutPromise={() =>
        checkoutSessionClient({
          username: 'username',
          url: '/api/checkout_sessions',
          customSubmitMessage: 'Thank you for your support',
          isDonate: true,
          price: 500,
        })
      }
    />
  )
}
```
