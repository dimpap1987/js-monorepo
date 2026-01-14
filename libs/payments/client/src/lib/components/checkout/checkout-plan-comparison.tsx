'use client'

import { formatPrice } from '@js-monorepo/currency'
import { cn } from '@js-monorepo/ui/util'
import { useLocale } from 'next-intl'
import { Check } from 'lucide-react'
import { PricingCardData } from '../../types'

interface CheckoutPlanComparisonProps {
  plans: PricingCardData[]
  selectedPlanId: number
  onSelectPlan: (planId: number) => void
  className?: string
}

export function CheckoutPlanComparison({
  plans,
  selectedPlanId,
  onSelectPlan,
  className,
}: CheckoutPlanComparisonProps) {
  const locale = useLocale() as 'en' | 'el'

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-medium text-foreground-neutral uppercase tracking-wide">Change Plan</h3>
      <div className="grid grid-cols-1 gap-3">
        {plans.map((plan) => {
          const isSelected = plan.id === selectedPlanId
          const isFree = plan.price === 0
          const priceInCents = plan.priceInCents ?? plan.price
          const currency = plan.currency || (locale === 'el' ? 'EUR' : 'USD')
          const formattedPrice = isFree ? 'Free' : formatPrice(priceInCents, locale, currency)

          return (
            <button
              key={plan.id}
              onClick={() => !isFree && onSelectPlan(plan.id)}
              disabled={isFree}
              className={cn(
                'relative flex items-center justify-between p-4 rounded-lg border text-left transition-all',
                isSelected ? 'border-primary bg-accent ring-2 ring-primary' : 'border-border hover:border-primary',
                isFree && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="flex items-center gap-3">
                {/* Selection indicator */}
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                    isSelected ? 'border-primary bg-primary' : 'border-border'
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>

                <div>
                  <span className="font-medium text-foreground capitalize">{plan.name} Plan</span>
                  {isFree && <span className="ml-2 text-xs text-foreground-muted">(Free tier)</span>}
                </div>
              </div>

              <div className="text-right">
                <span className="font-semibold text-foreground">{formattedPrice}</span>
                {!isFree && <span className="text-sm text-foreground-neutral">/{plan.interval}</span>}
              </div>

              {/* Popular badge */}
              {plan.isPopular && (
                <span className="absolute -top-2 right-4 bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                  Popular
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
