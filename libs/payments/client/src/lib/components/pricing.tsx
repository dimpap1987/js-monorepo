'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { useNotifications } from '@js-monorepo/notification'
import { PricingPlanResponse } from '@js-monorepo/types'
import { loadStripe } from '@stripe/stripe-js'
import { useRouter } from 'next-nprogress-bar'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SessionSubscription, Subscription, SubscriptionPlan } from '../types'
import { apiCancelSubscription, apiCheckoutPlan, apiGetPlans, apiGetSubscription } from '../utils/api'
import { PlanCard } from './plan-card'
import { useSearchParams } from 'next/navigation'
import { ErrorDialog } from '@js-monorepo/dialog'

const PricingHeader = ({ title }: { title: string }) => (
  <section className="text-center">
    <h1 className="mt-2 tracking-tight">{title}</h1>
    <br />
  </section>
)

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

function usePlans() {
  const [plans, setPlans] = useState<PricingPlanResponse[]>([])

  const fetchPlans = useCallback(async () => {
    try {
      const response = await apiGetPlans()
      if (response.ok) setPlans(response.data)
    } catch (error) {
      console.error('Error fetching plans:', error)
    }
  }, [])

  return { plans, fetchPlans }
}

export function Pricing() {
  const { session, isLoggedIn } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addNotification } = useNotifications()
  const stripePromise = useMemo(() => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!), [])
  const [hasErrors, setHasErrors] = useState(false)
  const { plans, fetchPlans } = usePlans()
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
            actionLabel: 'Get Started',
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
    fetchPlans()
  }, [fetchPlans])

  useEffect(() => {
    if (sessionSubscription?.plans?.length) {
      fetchSubscriptions(sessionSubscription.plans)
    }
  }, [sessionSubscription, fetchSubscriptions])

  const handleCheckout = useCallback(
    async (priceId: number) => {
      try {
        if (!isLoggedIn) {
          router.push('/auth/login')
          return
        }
        const response = await apiCheckoutPlan(priceId)
        if (response.ok) {
          const stripe = await stripePromise
          const stripeResponse = await stripe?.redirectToCheckout({
            sessionId: response.data.sessionId,
          })
          if (stripeResponse?.error) {
            console.error('Stripe Checkout Error:', stripeResponse.error.message)
          }
        }
      } catch (error) {
        console.error('Checkout Error:', error)
        addNotification({
          closable: false,
          message: 'Something went wrong',
          description: 'Please try again later',
          type: 'error',
        })
      }
    },
    [isLoggedIn, router, stripePromise, addNotification]
  )

  const handleCancelSubscription = useCallback(async (priceId: number) => {
    try {
      const response = await apiCancelSubscription(priceId)
      if (response.ok) {
        addNotification({
          message: 'Cancelling Subscription',
          duration: 4000,
          description: 'Please wait...',
          type: 'spinner',
        })
      } else {
        addNotification({
          message: 'Something went wrong',
          description: 'Please try again later',
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Checkout Error:', error)
    }
  }, [])

  const handleErrorDialogClose = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.delete('success')
    router.replace(`${window.location.pathname}?${newSearchParams.toString()}`)
    setHasErrors(false)
  }

  return (
    <div>
      <PricingHeader title="Select a Pricing Plan" />
      <section className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(360px,1fr))] gap-6 py-5 px-5">
        {pricingCards?.map((card) => (
          <PlanCard
            key={card.id}
            handleCheckout={() => handleCheckout(card.id)}
            handleCancelSubscription={() => handleCancelSubscription(card.id)}
            anySubscribed={!!sessionSubscription?.plans?.length}
            isLoggedIn={isLoggedIn}
            subscription={subscriptionMap.get(card.id)}
            {...card}
          />
        ))}
      </section>
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
