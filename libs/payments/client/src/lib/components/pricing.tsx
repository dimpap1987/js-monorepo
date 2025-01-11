'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { useNotifications } from '@js-monorepo/notification'
import { PricingPlanResponse } from '@js-monorepo/types'
import { loadStripe } from '@stripe/stripe-js'
import { useRouter } from 'next-nprogress-bar'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  PlanCardPropsWithId,
  PlanCardStatus,
  SessionSubscription,
  Subscription,
  SubscriptionPlan,
} from '../types'
import {
  apiCancelSubscription,
  apiCheckoutPlan,
  apiGetPlans,
  apiGetSubscription,
} from '../utils/api'
import { PlanCard } from './plan-card'

const isSubscribed = (subscription: SessionSubscription, planId: number) =>
  subscription?.plans?.some(
    (p: SubscriptionPlan) => p.price?.product?.id === planId
  ) || false

const PricingHeader = ({ title }: { title: string }) => (
  <section className="text-center">
    <h1 className="mt-2 tracking-tight">{title}</h1>
    <br />
  </section>
)

export function Pricing() {
  const [plans, setPlans] = useState<PricingPlanResponse[]>([])
  const [subscriptionMap, setSubscriptionMap] = useState<
    Map<number, Subscription>
  >(new Map())
  const { session, isLoggedIn } = useSession()
  const router = useRouter()
  const { addNotification } = useNotifications()
  const stripePromise = useMemo(
    () => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!),
    []
  )

  const sessionSubscription = session?.subscription as SessionSubscription

  const pricingCards: PlanCardPropsWithId[] = plans
    .flatMap((plan) =>
      plan.prices
        .filter((price) => price.interval === 'month')
        .map((price) => ({
          id: price.id,
          title: plan.title,
          description: plan.description,
          price: price.unitAmount / 100,
          interval: price.interval,
          features: plan.features,
          actionLabel: 'Get Started',
          subscribed: isSubscribed(sessionSubscription, plan.id),
        }))
    )
    .sort((a, b) => a.price - b.price)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await apiGetPlans()
        if (response.ok) setPlans(response.data)
      } catch (error) {
        console.error('Error fetching plans:', error)
      }
    }
    fetchPlans()
  }, [])

  useEffect(() => {
    sessionSubscription?.plans?.forEach((element) => {
      if (element.subscriptionId) {
        apiGetSubscription(element.subscriptionId).then((res) => {
          if (res.ok) {
            const sub = res.data as Subscription
            setSubscriptionMap((prev) => {
              const updatedMap = new Map(prev)
              updatedMap.set(sub?.priceId, sub)
              return updatedMap
            })
          }
        })
      }
    })
  }, [sessionSubscription?.plans])

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
            console.error(
              'Stripe Checkout Error:',
              stripeResponse.error.message
            )
          }
        }
      } catch (error) {
        console.error('Checkout Error:', error)
        addNotification({
          message: 'Something went wrong',
          description: 'Please try again later',
          type: 'error',
        })
      }
    },
    [stripePromise, isLoggedIn]
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

  return (
    <div>
      <PricingHeader title="Select a Pricing Plan" />
      <section className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-6 mt-10">
        {pricingCards?.map((card) => (
          <PlanCard
            key={card.id}
            handleCheckout={() => handleCheckout(card.id)}
            handleCancelSubscription={() => handleCancelSubscription(card.id)}
            anySubscribed={!!sessionSubscription?.plans?.length}
            isLoggedIn={isLoggedIn}
            endDateSubscription={subscriptionMap.get(card.id)?.cancelAt}
            status={
              (subscriptionMap.get(card.id)?.status as PlanCardStatus) ||
              'default'
            }
            {...card}
          />
        ))}
      </section>
    </div>
  )
}
