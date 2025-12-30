'use client'

import { buildLoginUrl, useSession } from '@js-monorepo/auth/next/client'
import { ErrorDialog } from '@js-monorepo/dialog'
import { useRouter } from 'next-nprogress-bar'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePlans } from '../../queries/payments-queries'
import { POPULAR_PLAN_NAME, SessionSubscription, Subscription, SubscriptionPlan } from '../../types'
import { apiGetSubscription } from '../../utils/api'
import { PricingCard } from './pricing-card'
import { PricingFAQ } from './pricing-faq'
import { PricingHero } from './pricing-hero'
import { PricingTrustSignals } from './pricing-trust-signals'

function useSubscriptionMap() {
  const [subscriptionMap, setSubscriptionMap] = useState<Map<number, Subscription>>(new Map())

  const fetchSubscriptions = useCallback(async (plans: SubscriptionPlan[]) => {
    try {
      const promises = plans.map((plan) =>
        plan.subscriptionId
          ? apiGetSubscription(plan.subscriptionId).then((res) => {
              if (res.ok) {
                const sub = res.data as Subscription
                setSubscriptionMap((prev) => {
                  const updatedMap = new Map(prev)
                  updatedMap.set(sub?.priceId, sub)
                  return updatedMap
                })
              }
            })
          : Promise.resolve()
      )
      await Promise.all(promises)
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    }
  }, [])

  return { subscriptionMap, fetchSubscriptions }
}

export function Pricing() {
  const { session, isLoggedIn } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hasErrors, setHasErrors] = useState(false)
  const { data: plans = [], isLoading: isLoadingPlans } = usePlans()
  const { subscriptionMap, fetchSubscriptions } = useSubscriptionMap()

  const sessionSubscription = session?.subscription as SessionSubscription

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
            subscribed: !!subscriptionMap.get(price.id),
          }))
      )
      .sort((a, b) => a.price - b.price)
  }, [plans, subscriptionMap])

  useEffect(() => {
    if (searchParams?.get('success') === 'false') {
      setHasErrors(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (sessionSubscription?.plans?.length) {
      fetchSubscriptions(sessionSubscription.plans)
    }
  }, [sessionSubscription, fetchSubscriptions])

  const handleSelectPlan = useCallback(
    (priceId: number) => {
      const checkoutUrl = `/checkout?planId=${priceId}`
      if (!isLoggedIn) {
        router.push(buildLoginUrl(checkoutUrl))
        return
      }
      router.push(checkoutUrl)
    },
    [isLoggedIn, router]
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
            anySubscribed={!!sessionSubscription?.plans?.length}
            isLoggedIn={isLoggedIn}
            subscription={subscriptionMap.get(card.id)}
            onSelect={handleSelectPlan}
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
