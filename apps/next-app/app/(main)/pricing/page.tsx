import { Pricing } from '@js-monorepo/payments-ui'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing Plans',
}

function PricingPage() {
  return (
    <div className="px-2">
      <Pricing></Pricing>
    </div>
  )
}

export default PricingPage
