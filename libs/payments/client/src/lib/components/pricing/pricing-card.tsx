'use client'

import { DpButton } from '@js-monorepo/button'
import { Card, CardContent, CardFooter, CardHeader } from '@js-monorepo/components/card'
import { cn } from '@js-monorepo/ui/util'
import { Check } from 'lucide-react'
import { Subscription, TrialEligibilityResponse } from '../../types'

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
  interval,
  features,
  isPopular,
  subscribed,
  anySubscribed,
  isLoggedIn,
  onSelect,
  onStartTrial,
  isLoading,
  isTrialLoading,
  trialEligibility,
  isOnTrial,
}: PricingCardProps) {
  const isFree = price === 0
  const canTrial = isLoggedIn && !isFree && trialEligibility?.eligible && !subscribed

  const isCurrentTrial = subscribed && isOnTrial

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
        'relative flex flex-col transition-all duration-300',
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
            <span className="bg-status-warning-bg text-status-warning text-xs font-semibold px-3 py-1 rounded-full ring ring-status-warning/50">
              On Trial
            </span>
          ) : isCurrentPlan ? (
            <span className="bg-status-success-bg text-status-success text-xs font-semibold px-3 py-1 rounded-full ring ring-status-success/50">
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
