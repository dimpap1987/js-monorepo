import { ContainerTemplate } from '@js-monorepo/templates'
import { Pricing } from '@js-monorepo/payments-ui'
import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '../../../lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Pricing',
  description:
    'Choose the perfect plan for your needs. Flexible pricing options with transparent costs and no hidden fees.',
  keywords: ['pricing', 'plans', 'subscription', 'pricing tiers'],
  type: 'website',
})

function PricingPage() {
  return (
    <ContainerTemplate>
      <div className="px-2">
        <Pricing></Pricing>
      </div>
    </ContainerTemplate>
  )
}

export default PricingPage
