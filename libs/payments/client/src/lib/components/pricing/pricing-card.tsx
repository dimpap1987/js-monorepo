'use client'

import { DpButton } from '@js-monorepo/button'
import { formatPrice } from '@js-monorepo/currency'
import { Card, CardContent, CardFooter, CardHeader } from '@js-monorepo/components/ui/card'
import { UsageBar } from '@js-monorepo/components/ui/usage-bar'
import { cn } from '@js-monorepo/ui/util'
import { Check } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useMemo } from 'react'
import { Subscription, TrialEligibilityResponse } from '../../types'
import { ProductMetadata } from '@js-monorepo/types/pricing'

interface PricingCardProps {
  id: number
  name: string
  description: string
  price: number // Amount in dollars/euros (already converted from cents)
  priceInCents?: number // Original price in cents (for formatting)
  currency?: string // Currency code (e.g., 'USD', 'EUR')
  interval: string
  metadata: ProductMetadata
  isPopular?: boolean
  subscribed?: boolean
  anySubscribed?: boolean
  isLoggedIn?: boolean
  subscription?: Subscription
  onSelect: (planId: number) => void
  onStartTrial?: (planId: number) => void
  isLoading?: boolean
  isTrialLoading?: boolean
  trialEligibility?: TrialEligibilityResponse
  isOnTrial?: boolean
}

export function PricingCard({
  id,
  name,
  description,
  price,
  priceInCents,
  currency,
  interval,
  metadata,
  isPopular,
  subscribed,
  anySubscribed,
  isLoggedIn,
  subscription,
  onSelect,
  onStartTrial,
  isLoading,
  isTrialLoading,
  trialEligibility,
  isOnTrial,
}: PricingCardProps) {
  const locale = useLocale() as 'en' | 'el'
  const isFree = price === 0

  // Format price with currency symbol
  const formattedPrice = useMemo(() => {
    if (isFree) return 'Free'
    if (priceInCents !== undefined) {
      return formatPrice(priceInCents, locale, currency)
    }
    // Fallback: format the already-converted price
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || (locale === 'el' ? 'EUR' : 'USD'),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }, [isFree, priceInCents, price, locale, currency])
  const canTrial = isLoggedIn && !isFree && trialEligibility?.eligible && !subscribed
  const trialNotEligible = isLoggedIn && !isFree && trialEligibility && !trialEligibility.eligible && !subscribed

  const isCurrentTrial = subscribed && isOnTrial

  // Calculate trial progress
  const trialProgress = useMemo(() => {
    if (!isCurrentTrial || !subscription?.trialStart || !subscription?.trialEnd) {
      return null
    }

    const start = new Date(subscription.trialStart).getTime()
    const end = new Date(subscription.trialEnd).getTime()
    const now = Date.now()

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    const daysUsed = Math.ceil((now - start) / (1000 * 60 * 60 * 24))
    const daysRemaining = Math.max(0, totalDays - daysUsed)

    return { totalDays, daysUsed, daysRemaining }
  }, [isCurrentTrial, subscription?.trialStart, subscription?.trialEnd])

  const getButtonContent = () => {
    if (!isLoggedIn) {
      return 'Get Started'
    }
    if (isCurrentTrial) {
      return 'Subscribe Now'
    }
    if (subscribed) {
      return 'Current Plan'
    }
    if (isFree && anySubscribed) {
      return 'Included'
    }
    if (isFree && !anySubscribed) {
      return 'Current Plan'
    }
    return 'Get Started'
  }

  const isCurrentPaidPlan = subscribed && !isOnTrial
  const isCurrentFreePlan = isLoggedIn && isFree && !anySubscribed
  const isFreeWithSubscription = isFree && anySubscribed
  const isDisabled = isCurrentPaidPlan || isCurrentFreePlan || isFreeWithSubscription

  const isCurrentPlan = isCurrentPaidPlan || isCurrentFreePlan
  const showBadge = isCurrentPlan || isCurrentTrial || (isPopular && !anySubscribed)

  return (
    <Card
      className={cn(
        'relative flex flex-col transition-all duration-300 p-2 w-full',
        // Active/trial plan gets prominence, otherwise popular gets it (but not if user has any subscription)
        (isCurrentPlan || isCurrentTrial) && 'ring ring-status-success shadow-lg scale-[1.02]',
        !isCurrentPlan && !isCurrentTrial && isPopular && !anySubscribed && 'ring ring-primary shadow-lg scale-[1.02]',
        // Dim non-active plans when user has a subscription (including free)
        anySubscribed && !subscribed && 'opacity-60 hover:opacity-100'
      )}
    >
      {/* Badge - Priority: Active/Trial > Popular (only show Popular if no subscription) */}
      {showBadge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          {isCurrentTrial ? (
            <span className="bg-status-warning-bg text-status-warning text-xs font-semibold px-3 py-1 rounded-full ring ring-status-warning">
              On Trial
            </span>
          ) : isCurrentPlan ? (
            <span className="bg-status-success-bg text-status-success text-xs font-semibold px-3 py-1 rounded-full ring ring-status-success">
              Active
            </span>
          ) : (
            <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              Most Popular
            </span>
          )}
        </div>
      )}

      <CardHeader className="text-center pb-2">
        <h2 className="text-xl font-semibold text-foreground capitalize">{name} Plan</h2>
        <p className="text-sm text-foreground-neutral mt-1">{description}</p>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Price */}
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-foreground">{formattedPrice}</span>
            {!isFree && interval && <span className="text-foreground-neutral">/{interval}</span>}
          </div>
        </div>

        {/* Trial Progress Bar */}
        {trialProgress && (
          <div className="mb-6">
            <UsageBar
              current={trialProgress.daysUsed}
              max={trialProgress.totalDays}
              label="Trial remaining"
              size="md"
              variant="auto"
            />
          </div>
        )}

        {/* Features */}
        <ul className="space-y-3">
          {Object.entries(metadata?.features ?? {}).map(([key, value]) => (
            <li key={key} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-status-success flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground">{value as string}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <DpButton
          className="w-full"
          size="large"
          variant={
            isCurrentTrial ? 'primary' : isCurrentPlan ? 'outline' : isPopular && !anySubscribed ? 'primary' : 'outline'
          }
          disabled={isDisabled || isLoading}
          loading={isLoading && !isCurrentPlan && !isFree && anySubscribed}
          onClick={() => onSelect(id)}
        >
          {getButtonContent()}
        </DpButton>
        {canTrial && (
          <DpButton
            className="w-full"
            size="large"
            variant="ghost"
            disabled={isTrialLoading}
            loading={isTrialLoading}
            onClick={() => onStartTrial?.(id)}
          >
            Start {trialEligibility.trialDurationDays}-day Free Trial
          </DpButton>
        )}
      </CardFooter>
    </Card>
  )
}
