import { Checkout } from '@js-monorepo/payments-ui'
import { generateMetadata } from '@js-monorepo/seo'
import { ContainerTemplate } from '@js-monorepo/templates'
import { Metadata } from 'next'

export const metadata: Metadata = generateMetadata({
  title: 'Checkout',
  description: 'Complete your subscription purchase securely.',
  keywords: ['checkout', 'payment', 'subscription'],
  type: 'website',
  noindex: true,
})

function CheckoutPage() {
  return (
    <ContainerTemplate>
      <Checkout />
    </ContainerTemplate>
  )
}

export default CheckoutPage
