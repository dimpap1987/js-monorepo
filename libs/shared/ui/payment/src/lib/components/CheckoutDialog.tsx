import { DpDialog, DpDialogContent } from '@js-monorepo/dialog'
import { useNotifications } from '@js-monorepo/notification'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js/pure'
import { ForwardedRef, forwardRef, useEffect, useMemo, useState } from 'react'

interface DpCheckoutDialogProps {
  stripePublishableKey: string
  isOpen: boolean
  checkOutPromise: () => Promise<Response>
  onClose: () => void
}

async function initStripe(stripePublishableKey: string) {
  loadStripe.setLoadParameters({ advancedFraudSignals: false })
  return loadStripe(stripePublishableKey)
}

const DpCheckoutDialog = forwardRef(
  (
    {
      stripePublishableKey,
      isOpen,
      checkOutPromise,
      onClose,
    }: DpCheckoutDialogProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
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
          isOpen &&
          response?.clientSecret != null &&
          stripeInstance !== undefined
        }
        onClose={onClose}
        className="text-black top-24 shadow-2xl shadow-cyan-500/50 w-full sm:w-[460px] md:w-[60%]"
        ref={ref}
      >
        <DpDialogContent>
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
)
DpCheckoutDialog.displayName = 'DpCheckoutDialog'
export default DpCheckoutDialog
