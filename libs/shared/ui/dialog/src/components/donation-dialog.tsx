'use client'

import { Dialog, DialogTrigger, DpDialogContent } from '@js-monorepo/components'
import { useNotifications } from '@js-monorepo/notification'
import { ClientResponseType } from '@js-monorepo/types'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js/pure'
import { PropsWithChildren, useEffect, useMemo, useState } from 'react'

interface DonationDialogComponentProps {
  stripePublishableKey: string
  checkOutPromise: () => Promise<ClientResponseType<any>>
}

async function initStripe(stripePublishableKey: string) {
  loadStripe.setLoadParameters({ advancedFraudSignals: false })
  return loadStripe(stripePublishableKey)
}

function DonationDialogComponent({
  children,
  checkOutPromise,
  stripePublishableKey,
}: DonationDialogComponentProps & Readonly<PropsWithChildren>) {
  const [response, setResponse] = useState<{
    clientSecret: string
  } | null>(null)
  const [addNotification] = useNotifications()

  const stripeInstance = useMemo(
    () => initStripe(stripePublishableKey),
    [stripePublishableKey]
  )

  useEffect(() => {
    checkOutPromise()
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch client secret')
        }
        return res.data
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
      })
  }, [])
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
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
    </Dialog>
  )
}
DonationDialogComponent.displayName = 'DonationDialogComponent'

export { DonationDialogComponent }
