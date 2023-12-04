'use client'
import { DialogComponent, DialogContent } from '@js-monorepo/dialog'
import { useNotifications } from '@js-monorepo/notification'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js/pure'

async function initStripe(isOpen: boolean, stripePublishableKey: string) {
  if (isOpen) {
    loadStripe.setLoadParameters({ advancedFraudSignals: false })
    return loadStripe(stripePublishableKey)
  }
  return null
}

function EmbeddedCheckoutComponentDialog({
  stripePublishableKey,
  isOpen,
  onClose,
  checkOutPromise,
}: {
  readonly stripePublishableKey: string
  readonly isOpen: boolean
  readonly checkOutPromise: () => Promise<any>
  readonly onClose: () => void
}) {
  const [response, setResponse] = useState<{
    clientSecret: string
  } | null>(null)
  const [, , addNotification] = useNotifications()

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
    <DialogComponent
      isOpen={isOpen && response?.clientSecret != null}
      onClose={onClose}
      className="text-black shadow-2xl shadow-cyan-500/50 w-full sm:w-[460px] md:w-[60%]"
    >
      <DialogContent className="p-4">
        <EmbeddedCheckoutProvider
          stripe={initStripe(isOpen, stripePublishableKey)}
          options={{
            clientSecret: response?.clientSecret ?? '',
            onComplete: () => {
              console.debug('Transaction completed successfully')
            },
          }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </DialogContent>
    </DialogComponent>
  )
}

export default EmbeddedCheckoutComponentDialog
