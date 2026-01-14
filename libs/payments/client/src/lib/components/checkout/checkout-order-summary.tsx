'use client'

import { Card, CardContent, CardHeader } from '@js-monorepo/components/ui/card'
import { Separator } from '@js-monorepo/components/ui/separator'
import { formatPrice } from '@js-monorepo/currency'
import { ProductMetadata } from '@js-monorepo/types/pricing'
import { cn } from '@js-monorepo/ui/util'
import { useLocale } from 'next-intl'
import { Check } from 'lucide-react'
import { PlanBadge } from '../plan-badge'

interface CheckoutOrderSummaryProps {
  plan: {
    name: string
    description: string
    price: number // In cents
    priceInCents?: number
    currency?: string
    interval: string
    metadata?: ProductMetadata
  }
  className?: string
}

export function CheckoutOrderSummary({ plan, className }: CheckoutOrderSummaryProps) {
  const locale = useLocale() as 'en' | 'el'
  const priceInCents = plan.priceInCents ?? plan.price
  const currency = plan.currency || (locale === 'el' ? 'EUR' : 'USD')
  const formattedPrice = formatPrice(priceInCents, locale, currency)

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-4">
        <h2 className="text-xl font-semibold text-foreground">Order Summary</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground capitalize">{plan.name} Plan</span>
            <span className="font-semibold text-foreground">
              <PlanBadge plan={plan.name} size="xl"></PlanBadge>
            </span>
          </div>
          <p className="text-sm text-foreground-neutral">{plan.description}</p>
        </div>

        <Separator />

        {/* Features Included */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground-neutral tracking-wide">Included Features</h3>
          <ul className="space-y-2">
            {Object.entries(plan.metadata?.features ?? {}).map(([key, value]) => (
              <li key={key} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-status-success flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{value as string}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Total */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span className="text-foreground">Total</span>
            <span className="text-foreground">
              {formattedPrice}/{plan.interval}
            </span>
          </div>
          <p className="text-xs text-foreground-muted">
            You&apos;ll be charged {formattedPrice} today, then {formattedPrice} every {plan.interval}
            {plan.interval === 'month' ? ' thereafter' : ''}.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
