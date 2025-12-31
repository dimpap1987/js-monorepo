'use client'

import { buildLoginUrl, useSession } from '@js-monorepo/auth/next/client'
import { ErrorDialog } from '@js-monorepo/dialog'
import { useNotifications } from '@js-monorepo/notification'
import { useRouter } from 'next-nprogress-bar'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePlans } from '../../queries/payments-queries'
import { POPULAR_PLAN_NAME, SessionSubscription, Subscription } from '../../types'
import { apiCreatePortalSession, apiGetSubscription } from '../../utils/api'
import { PricingCard } from './pricing-card'
import { PricingFAQ } from './pricing-faq'
import { PricingHero } from './pricing-hero'
import { PricingTrustSignals } from './pricing-trust-signals'

export function Pricing() {
  const { session, isLoggedIn } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hasErrors, setHasErrors] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isPortalLoading, setIsPortalLoading] = useState(false)
  const { data: plans = [] } = usePlans()
  const { addNotification } = useNotifications()

  const sessionSubscription = session?.subscription as SessionSubscription | undefined

  const pricingCards = useMemo(() => {
    return plans
      .flatMap((plan) =>
        plan.prices
          .filter((price) => price.interval === 'month')
          .map((price) => ({
            id: price.id,
            name: plan.name,
            description: plan.description,
            price: price.unitAmount / 100,
            interval: price.interval,
            features: plan.features,
            isPopular: plan.name.toLowerCase() === POPULAR_PLAN_NAME,
            subscribed: sessionSubscription?.priceId === price.id,
          }))
      )
      .sort((a, b) => a.price - b.price)
  }, [plans, sessionSubscription?.priceId])

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
      // If user has subscription and clicks a different plan, open portal to switch
      if (sessionSubscription?.isSubscribed && sessionSubscription?.priceId !== priceId) {
        handleManageSubscription()
        return
      }
      router.push(checkoutUrl)
    },
    [isLoggedIn, router, sessionSubscription?.isSubscribed, sessionSubscription?.priceId, handleManageSubscription]
  )

  const handleErrorDialogClose = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.delete('success')
    router.replace(`${window.location.pathname}?${newSearchParams.toString()}`)
    setHasErrors(false)
  }

  return (
    <div className="space-y-8 py-8">
      {/* Hero Section */}
      <PricingHero
        title="Choose the Right Plan for You"
        subtitle="Simple, transparent pricing that grows with you. Start free and upgrade when you're ready."
      />

      {/* Trust Signals */}
      <PricingTrustSignals />

      {/* Pricing Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {pricingCards?.map((card) => (
          <PricingCard
            key={card.id}
            id={card.id}
            name={card.name}
            description={card.description}
            price={card.price}
            interval={card.interval}
            features={card.features}
            isPopular={card.isPopular}
            subscribed={card.subscribed}
            anySubscribed={!!sessionSubscription?.isSubscribed}
            isLoggedIn={isLoggedIn}
            subscription={card.subscribed ? subscription ?? undefined : undefined}
            onSelect={handleSelectPlan}
            isLoading={isPortalLoading}
          />
        ))}
      </section>

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
    </div>
  )
}
