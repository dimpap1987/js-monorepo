'use client'

import { buildLoginUrl, useSession } from '@js-monorepo/auth/next/client'
import { centsToAmount } from '@js-monorepo/currency'
import { SnapCarousel } from '@js-monorepo/components/ui/snap-carousel'
import { ConfirmDialog, ErrorDialog } from '@js-monorepo/dialog'
import { useNotifications } from '@js-monorepo/notification'
import { useRouter } from 'next-nprogress-bar'
import { useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePlans } from '../../queries/payments-queries'
import { POPULAR_PLAN_NAME, SessionSubscription, Subscription } from '../../types'
import { apiCreatePortalSession, apiGetSubscription, apiStartTrial } from '../../utils/api'
import { PricingCard } from './pricing-card'
import { PricingCardSkeleton } from './pricing-card-skeleton'
import { PricingFAQ } from './pricing-faq'
import { PricingHero } from './pricing-hero'
import { PricingTrustSignals } from './pricing-trust-signals'
import { SubscriptionStatusIndication } from './subscription-status-indication'

export function Pricing() {
  const locale = useLocale() as 'en' | 'el'
  const { session, isLoggedIn } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hasErrors, setHasErrors] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isPortalLoading, setIsPortalLoading] = useState(false)
  const [trialLoadingPriceId, setTrialLoadingPriceId] = useState<number | null>(null)
  const [showConfirmTrialDialog, setShowConfirmTrialDialog] = useState(false)
  const [trialPriceIdToConfirm, setTrialPriceIdToConfirm] = useState<number | null>(null)
  const { data: plans = [], isLoading: isPlansLoading } = usePlans()
  const { addNotification } = useNotifications()

  const sessionSubscription = session?.subscription as SessionSubscription | undefined

  const pricingCards = useMemo(() => {
    const currentPlanName = sessionSubscription?.plan?.toLowerCase()
    const paidPlanName = sessionSubscription?.paidSubscriptionPlan?.toLowerCase()

    return plans
      .flatMap((plan) =>
        plan.prices
          .filter((price) => price.interval === 'month')
          .map((price) => {
            const planNameLower = plan.name.toLowerCase()
            // Check if user is subscribed to this plan by priceId OR plan name
            // This handles cases where user has Basic subscription but is on Pro trial
            const isSubscribedByPriceId = sessionSubscription?.priceId === price.id
            const isSubscribedByPlanName = planNameLower === currentPlanName || planNameLower === paidPlanName

            return {
              id: price.id,
              name: plan.name,
              description: plan.description,
              price: centsToAmount(price.unitAmount), // Convert cents to amount
              priceInCents: price.unitAmount, // Keep original for formatting
              currency: price.currency,
              interval: price.interval,
              metadata: plan.metadata,
              isPopular: plan.name.toLowerCase() === POPULAR_PLAN_NAME,
              subscribed: isSubscribedByPriceId || isSubscribedByPlanName,
              trialEligibility: price.trialEligibility,
            }
          })
      )
      .sort((a, b) => a.price - b.price)
  }, [plans, sessionSubscription?.priceId, sessionSubscription?.plan, sessionSubscription?.paidSubscriptionPlan])

  useEffect(() => {
    if (searchParams?.get('success') === 'false') {
      setHasErrors(true)
    }
  }, [searchParams])

  // Fetch full subscription details when user has an active subscription
  useEffect(() => {
    if (sessionSubscription?.subscriptionId) {
      apiGetSubscription(sessionSubscription.subscriptionId).then((res) => {
        if (res.ok) {
          setSubscription(res.data as Subscription)
        }
      })
    }
  }, [sessionSubscription?.subscriptionId])

  const handleManageSubscription = useCallback(async () => {
    setIsPortalLoading(true)
    try {
      const returnUrl = window.location.href
      const response = await apiCreatePortalSession(returnUrl)

      if (response.ok && response.data?.url) {
        window.location.href = response.data.url
      } else {
        addNotification({
          message: 'Failed to open subscription portal',
          description: 'Please try again or contact support',
          type: 'error',
        })
        setIsPortalLoading(false)
      }
    } catch (error) {
      addNotification({
        message: 'Something went wrong',
        description: 'Please try again later',
        type: 'error',
      })
      setIsPortalLoading(false)
    }
  }, [addNotification])

  const handleSelectPlan = useCallback(
    (priceId: number) => {
      const checkoutUrl = `/checkout?planId=${priceId}`
      if (!isLoggedIn) {
        router.push(buildLoginUrl(checkoutUrl))
        return
      }
      // If user has PAID subscription (not trial) and clicks a different plan, open portal to switch
      // Trial users should go to checkout since they don't have a Stripe subscription yet
      const hasPaidSubscription = sessionSubscription?.isSubscribed && !sessionSubscription?.isTrial
      if (hasPaidSubscription && sessionSubscription?.priceId !== priceId) {
        handleManageSubscription()
        return
      }
      router.push(checkoutUrl)
    },
    [
      isLoggedIn,
      router,
      sessionSubscription?.isSubscribed,
      sessionSubscription?.isTrial,
      sessionSubscription?.priceId,
      handleManageSubscription,
    ]
  )

  const handleConfirmStartTrial = useCallback(
    async (priceId: number) => {
      setTrialLoadingPriceId(priceId)
      try {
        const response = await apiStartTrial(priceId)

        if (response.ok && response.data) {
          addNotification({
            message: 'Trial Started!',
            description: response.data.message,
            type: 'success',
          })
          router.refresh()
        } else {
          addNotification({
            message: 'Could not start trial',
            description: 'Please try again or contact support',
            type: 'error',
          })
        }
      } catch {
        addNotification({
          message: 'Something went wrong',
          description: 'Please try again later',
          type: 'error',
        })
      } finally {
        setTrialLoadingPriceId(null)
        setShowConfirmTrialDialog(false) // Close dialog on completion
        setTrialPriceIdToConfirm(null) // Clear priceId
      }
    },
    [addNotification, router]
  )

  const handleStartTrial = useCallback((priceId: number) => {
    setTrialPriceIdToConfirm(priceId)
    setShowConfirmTrialDialog(true)
  }, [])

  const handleErrorDialogClose = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.delete('success')
    router.replace(`${window.location.pathname}?${newSearchParams.toString()}`)
    setHasErrors(false)
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <PricingHero
        title="Choose Your Plan."
        // subtitle="Start with our Free tier and unlock professional features when you're ready."
      />

      {/* Trust Signals */}
      <PricingTrustSignals />

      {/* Pricing Cards */}
      {/* Mobile: Snap Carousel */}
      <section className="md:hidden">
        {isPlansLoading ? (
          <SnapCarousel itemWidthPercent={75} gap={12} showIndicators={true}>
            {Array.from({ length: 3 }).map((_, i) => (
              <PricingCardSkeleton key={i} />
            ))}
          </SnapCarousel>
        ) : (
          <SnapCarousel
            activeIndex={(() => {
              const subscribedIndex = pricingCards.findIndex((card) => card.subscribed)
              // If subscribed, show that card; otherwise show middle card (index 1 for 3 items)
              return subscribedIndex >= 0 ? subscribedIndex : undefined
            })()}
            itemWidthPercent={75}
            gap={12}
            showIndicators={true}
          >
            {pricingCards.map((card) => {
              // Check if this specific card is on trial (not just any subscription)
              const isThisCardOnTrial =
                sessionSubscription?.isTrial &&
                (sessionSubscription?.priceId === card.id ||
                  sessionSubscription?.plan?.toLowerCase() === card.name.toLowerCase())

              return (
                <PricingCard
                  key={card.id}
                  id={card.id}
                  name={card.name}
                  description={card.description}
                  price={card.price}
                  priceInCents={card.priceInCents}
                  currency={card.currency}
                  interval={card.interval}
                  metadata={card.metadata}
                  isPopular={card.isPopular}
                  subscribed={card.subscribed}
                  anySubscribed={!!sessionSubscription?.isSubscribed}
                  isLoggedIn={isLoggedIn}
                  subscription={card.subscribed ? subscription ?? undefined : undefined}
                  onSelect={handleSelectPlan}
                  onStartTrial={handleStartTrial}
                  isLoading={isPortalLoading}
                  isTrialLoading={trialLoadingPriceId === card.id}
                  trialEligibility={card.trialEligibility}
                  isOnTrial={isThisCardOnTrial}
                />
              )
            })}
          </SnapCarousel>
        )}
      </section>

      {/* Desktop: Grid Layout - CSS-only responsive grid */}
      <section
        className="hidden md:grid gap-8 py-2 max-w-6xl mx-auto justify-items-center self-end"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
      >
        {isPlansLoading
          ? Array.from({ length: 3 }).map((_, i) => <PricingCardSkeleton key={i} />)
          : pricingCards.map((card) => {
              // Check if this specific card is on trial (not just any subscription)
              const isThisCardOnTrial =
                sessionSubscription?.isTrial &&
                (sessionSubscription?.priceId === card.id ||
                  sessionSubscription?.plan?.toLowerCase() === card.name.toLowerCase())

              return (
                <PricingCard
                  key={card.id}
                  id={card.id}
                  name={card.name}
                  description={card.description}
                  price={card.price}
                  priceInCents={card.priceInCents}
                  currency={card.currency}
                  interval={card.interval}
                  metadata={card.metadata}
                  isPopular={card.isPopular}
                  subscribed={card.subscribed}
                  anySubscribed={!!sessionSubscription?.isSubscribed}
                  isLoggedIn={isLoggedIn}
                  subscription={card.subscribed ? subscription ?? undefined : undefined}
                  onSelect={handleSelectPlan}
                  onStartTrial={handleStartTrial}
                  isLoading={isPortalLoading}
                  isTrialLoading={trialLoadingPriceId === card.id}
                  trialEligibility={card.trialEligibility}
                  isOnTrial={isThisCardOnTrial}
                />
              )
            })}
      </section>

      {/* Subscription Status Indication */}
      <SubscriptionStatusIndication subscription={sessionSubscription} className="max-w-6xl mx-auto px-4" />
      {/* FAQ Section */}
      <PricingFAQ className="px-4" />

      {/* Error Dialog */}
      {hasErrors && (
        <ErrorDialog
          isOpen={hasErrors}
          title="Payment Unsuccessful"
          errorMessage="Something went wrong, please verify your payment details."
          onClose={handleErrorDialogClose}
        />
      )}

      {/* Confirm Trial Dialog */}
      <ConfirmDialog
        open={showConfirmTrialDialog}
        onOpenChange={setShowConfirmTrialDialog}
        title="Start Free Trial?"
        description="By confirming, you will start a free trial for this plan. You can cancel anytime."
        confirmLabel="Start Trial"
        onConfirm={() => {
          if (trialPriceIdToConfirm) {
            handleConfirmStartTrial(trialPriceIdToConfirm)
          }
        }}
        isLoading={trialLoadingPriceId === trialPriceIdToConfirm}
      />
    </div>
  )
}
