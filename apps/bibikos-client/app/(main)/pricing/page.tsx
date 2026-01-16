import { Pricing } from '@js-monorepo/payments-ui'
import { generateMetadata } from '@js-monorepo/seo'
import { ContainerTemplate } from '@js-monorepo/templates'
import { Metadata } from 'next'

export const metadata: Metadata = generateMetadata({
  title: 'Pricing',
  description:
    'Choose the perfect plan for your needs. Flexible pricing options with transparent costs and no hidden fees.',
  keywords: ['pricing', 'plans', 'subscription', 'pricing tiers'],
  type: 'website',
})

export default function PricingPage() {
  return (
    <ContainerTemplate className="px-2">
      <Pricing></Pricing>
    </ContainerTemplate>
  )
}
