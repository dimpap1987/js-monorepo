import { DpDialog, DpDialogContent } from '@js-monorepo/dialog'
import { useNotifications } from '@js-monorepo/notification'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js/pure'
import { useEffect, useMemo, useState } from 'react'

async function initStripe(stripePublishableKey: string) {
  loadStripe.setLoadParameters({ advancedFraudSignals: false })
  return loadStripe(stripePublishableKey)
}

function DpCheckoutDialog({
  stripePublishableKey,
  isOpen,
  onClose,
  checkOutPromise,
}: {
  readonly stripePublishableKey: string
  readonly isOpen: boolean
  readonly checkOutPromise: () => Promise<Response>
  readonly onClose: () => void
}) {
  const [response, setResponse] = useState<{
    clientSecret: string
  } | null>(null)
  const [addNotification] = useNotifications()

  const stripeInstance = useMemo(
    () => initStripe(stripePublishableKey),
    [stripePublishableKey]
  )

  useEffect(() => {
    if (!isOpen) {
      return
    }

    checkOutPromise()
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch client secret')
        }
        return res.json()
      })
      .then((data) => {
        setResponse({ ...data })
      })
      .catch((error) => {
        console.error('Error fetching client secret:', error)
        addNotification({
          message: 'Something went wrong',
          description: 'Please try again later...',
          type: 'error',
          duration: 4000,
        })
        onClose()
      })
    return () => {
      setResponse(null)
    }
  }, [isOpen])

  return (
    <DpDialog
      isOpen={
        isOpen && response?.clientSecret != null && stripeInstance !== undefined
      }
      onClose={onClose}
      className="text-black shadow-2xl shadow-cyan-500/50 w-full sm:w-[460px] md:w-[60%]"
    >
      <DpDialogContent className="p-4">
        <EmbeddedCheckoutProvider
          stripe={stripeInstance}
          options={{
            clientSecret: response?.clientSecret ?? '',
            onComplete: () => {
              console.debug('Transaction completed successfully')
            },
          }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </DpDialogContent>
    </DpDialog>
  )
}

export default DpCheckoutDialog
