'use client'

import { Card, CardContent, CardHeader } from '@js-monorepo/components/card'
import { Separator } from '@js-monorepo/components/separator'
import { cn } from '@js-monorepo/ui/util'
import { Check } from 'lucide-react'

interface CheckoutOrderSummaryProps {
  plan: {
    name: string
    description: string
    price: number
    interval: string
    features: Record<string, string>
  }
  className?: string
}

export function CheckoutOrderSummary({ plan, className }: CheckoutOrderSummaryProps) {
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
              €{plan.price}/{plan.interval}
            </span>
          </div>
          <p className="text-sm text-foreground-neutral">{plan.description}</p>
        </div>

        <Separator />

        {/* Features Included */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground-neutral tracking-wide">Included Features</h3>
          <ul className="space-y-2">
            {Object.entries(plan.features).map(([key, value]) => (
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
              €{plan.price}/{plan.interval}
            </span>
          </div>
          <p className="text-xs text-foreground-muted">
            You&apos;ll be charged €{plan.price} today, then €{plan.price} every {plan.interval}
            {plan.interval === 'month' ? ' thereafter' : ''}.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
