'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { PricingPlanResponse } from '@js-monorepo/types'
import { loadStripe } from '@stripe/stripe-js'
import { useRouter } from 'next-nprogress-bar'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiCheckoutPlan, apiGetPlans } from '../utils/api'
import { PlanCard, PlanCardProps } from './plan-card'

interface Product {
  id: number
}
interface Price {
  product: Product
}
interface Plan {
  price?: Price
}
interface Subscription {
  plans?: Plan[]
}

type PlanCardPropsWithId = Omit<
  { id: number } & PlanCardProps,
  'isLoggedIn' | 'handleCheckout'
>

const isSubscribed = (subscription: Subscription, planId: number) =>
  subscription?.plans?.some((p: Plan) => p.price?.product?.id === planId) ||
  false

const PricingHeader = ({ title }: { title: string }) => (
  <section className="text-center">
    <h1 className="mt-2 tracking-tight">{title}</h1>
    <br />
  </section>
)

export function Pricing() {
  const [plans, setPlans] = useState<PricingPlanResponse[]>([])
  const {
    session: { subscription },
    isLoggedIn,
  } = useSession()
  const router = useRouter()
  const stripePromise = useMemo(
    () => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!),
    []
  )

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
          subscribed: isSubscribed(subscription, plan.id),
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
      }
    },
    [stripePromise]
  )

  return (
    <div>
      <PricingHeader title="Select a Pricing Plan" />
      <section className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-6 mt-10">
        {pricingCards?.map((card) => (
          <PlanCard
            key={card.id}
            handleCheckout={() => handleCheckout(card.id)}
            anySubscribed={subscription?.plans?.length > 0}
            isLoggedIn={isLoggedIn}
            {...card}
          />
        ))}
      </section>
    </div>
  )
}
