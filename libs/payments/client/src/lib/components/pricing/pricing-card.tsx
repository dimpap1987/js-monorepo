'use client'

import { DpButton } from '@js-monorepo/button'
import { Card, CardContent, CardFooter, CardHeader } from '@js-monorepo/components/card'
import { cn } from '@js-monorepo/ui/util'
import { Check } from 'lucide-react'
import { Subscription } from '../../types'

interface PricingCardProps {
  id: number
  name: string
  description: string
  price: number
  interval: string
  features: Record<string, string>
  isPopular?: boolean
  subscribed?: boolean
  anySubscribed?: boolean
  isLoggedIn?: boolean
  subscription?: Subscription
  onSelect: (planId: number) => void
  isLoading?: boolean
}

export function PricingCard({
  id,
  name,
  description,
  price,
  interval,
  features,
  isPopular,
  subscribed,
  anySubscribed,
  isLoggedIn,
  onSelect,
  isLoading,
}: PricingCardProps) {
  const isFree = price === 0

  const getButtonContent = () => {
    if (!isLoggedIn) {
      return 'Get Started'
    }
    if (isFree && !anySubscribed) {
      return 'Current Plan'
    }
    if (subscribed) {
      return 'Current Plan'
    }
    return 'Get Started'
  }

  const isCurrentPlan = subscribed || (isLoggedIn && isFree && !anySubscribed)
  const isDisabled = isCurrentPlan

  return (
    <Card
      className={cn(
        'relative flex flex-col transition-all duration-300',
        isPopular && 'border-primary shadow-lg scale-[1.02]',
        anySubscribed && !subscribed && !isFree && 'opacity-60 hover:opacity-100',
        subscribed && 'border-status-success'
      )}
    >
      {/* Most Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      {/* Active Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-status-success-bg text-status-success text-xs font-semibold px-3 py-1 rounded-full border border-status-success/50">
            Active
          </span>
        </div>
      )}

      <CardHeader className="text-center pb-2">
        <h3 className="text-xl font-semibold text-foreground capitalize">{name} Plan</h3>
        <p className="text-sm text-foreground-neutral mt-1">{description}</p>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Price */}
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-foreground">{isFree ? 'Free' : `€${price}`}</span>
            {!isFree && interval && <span className="text-foreground-neutral">/{interval}</span>}
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-3">
          {Object.entries(features).map(([key, value]) => (
            <li key={key} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-status-success flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground">{value as string}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <DpButton
          className="w-full"
          size="large"
          variant={isPopular ? 'primary' : 'outline'}
          disabled={isDisabled}
          loading={isLoading}
          onClick={() => onSelect(id)}
        >
          {getButtonContent()}
        </DpButton>
      </CardFooter>
    </Card>
  )
}
