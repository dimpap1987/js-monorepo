'use client'
import { DialogComponent, DialogContent } from '@js-monorepo/dialog'
import { useNotifications } from '@js-monorepo/notification'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useEffect, useState } from 'react'

function EmbeddedCheckoutComponentDialog({
  stripePublishableKey,
  isOpen,
  onClose,
  price,
}: {
  stripePublishableKey: string
  isOpen: boolean
  price: number
  onClose: () => void
}) {
  const [clientSecret, setClientSecret] = useState(null)
  const [, , addNotification] = useNotifications()

  useEffect(() => {
    if (!isOpen && price > 0) {
      return
    }

    fetch('/api/checkout_sessions', {
      body: JSON.stringify({ price }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch client secret')
        }
        return res.json()
      })
      .then((data) => {
        setClientSecret(data.clientSecret)
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
  }, [isOpen, price])

  return (
    <DialogComponent
      isOpen={isOpen && clientSecret != null}
      onClose={onClose}
      className="text-black shadow-2xl shadow-cyan-500/50 w-full sm:w-[440px]"
    >
      <DialogContent>
        <EmbeddedCheckoutProvider
          stripe={loadStripe(stripePublishableKey)}
          options={{
            clientSecret,
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
