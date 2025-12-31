import { ContainerTemplate } from '@js-monorepo/templates'
import { Checkout } from '@js-monorepo/payments-ui'
import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '../../../lib/seo'

export const metadata: Metadata = generateSEOMetadata({
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
