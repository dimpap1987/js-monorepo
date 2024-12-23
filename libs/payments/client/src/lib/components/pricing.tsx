'use client'

import { useRouter } from 'next-nprogress-bar'

import { useSession } from '@js-monorepo/auth/next/client'
import { DpButton } from '@js-monorepo/button'
import { Tabs, TabsList, TabsTrigger } from '@js-monorepo/components/tabs'
import { PricingPlanResponse } from '@js-monorepo/types'
import { cn } from '@js-monorepo/ui/util'
import { loadStripe } from '@stripe/stripe-js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  apiCheckoutPlan,
  apiGetPlans,
  getFreePlansByInterval,
} from '../utils/api'

type PricingCardProps = {
  handleCheckout?: () => Promise<any>
  price: number
  title: string
  description: string
  features: Record<string, string>
  interval: string
  actionLabel?: string
  popular?: boolean
  subscribed?: boolean
  isFree?: boolean
}

type PlansInterval = 'month' | 'year'

type PricingCardWithPriceId = Omit<
  { priceId: string } & PricingCardProps,
  'isLoggedIn' | 'handleCheckout'
>

type PricingSwitchProps = {
  onSwitch: (value: PlansInterval) => void
}

const CheckItem = ({ text }: { text: string }) => (
  <>
    <svg
      className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      ></path>
    </svg>
    <span>{text}</span>
  </>
)

const PricingHeader = ({ title }: { title: string }) => (
  <section className="text-center">
    <h1 className={`text-2xl sm:text-4xl mt-2 font-semibold tracking-tight`}>
      {title}
    </h1>
    <br />
  </section>
)

const PricingSwitch = ({ onSwitch }: PricingSwitchProps) => (
  <Tabs
    defaultValue="month"
    className="max-w-max mx-auto dark:bg-gray-800 p-2 mt-2 rounded-lg"
    onValueChange={(value) => onSwitch(value as PlansInterval)}
  >
    <TabsList className="p1">
      <TabsTrigger value="month" className="font-semibold text-lg">
        <p>Monthly</p>
      </TabsTrigger>
      <TabsTrigger value="year" className="font-semibold text-lg">
        <p>Yearly</p>
      </TabsTrigger>
    </TabsList>
  </Tabs>
)

const PricingCard = ({
  handleCheckout,
  title,
  price,
  interval,
  description,
  features,
  actionLabel,
  subscribed,
  isFree,
}: PricingCardProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const onCheckout = async () => {
    setIsLoading(true)
    try {
      await handleCheckout?.()
    } catch (error) {
      console.error('Stripe Checkout Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={cn(
        'relative bg-background-card w-full max-w-[360px] sm:w-[360px] shadow-lg',
        'flex flex-col justify-around p-6 mx-auto text-center rounded-lg border',
        subscribed ? 'border-primary border-2' : 'border-border'
      )}
    >
      {subscribed && (
        <div
          className="bg-green-50 text-green-600 absolute top-0 
                    -translate-y-1/2 right-5 z-10 p-1.5 px-3 border border-green-400 
                    rounded-full shadow-md font-medium"
        >
          Active
        </div>
      )}

      <h3 className="mb-4 text-2xl font-semibold">{title}</h3>
      <p className="font-light text-foreground-neutral sm:text-lg">
        {description}
      </p>
      <div className="flex justify-center items-baseline my-6">
        <span className="mr-2 text-5xl font-extrabold text-gray-900 dark:text-white">
          {`$${price}`}
        </span>

        <span className="text-gray-500 dark:text-gray-400">
          {interval && `/${interval}`}
        </span>
      </div>
      <ul role="list" className="mb-8 space-y-3 text-left mt-2">
        {Object.entries(features).map(([key, value]) => (
          <li key={key} className="flex items-center space-x-3">
            <CheckItem text={value} />
          </li>
        ))}
      </ul>
      <DpButton
        size="large"
        loading={isLoading}
        onClick={onCheckout}
        disabled={subscribed || isFree}
      >
        {actionLabel}
      </DpButton>
    </div>
  )
}

export function Pricing() {
  const [interval, setInterval] = useState<PlansInterval>('month')
  const [plans, setPlans] = useState<PricingPlanResponse[]>([])
  const router = useRouter()
  const {
    session: { subscription: userSubscription },
    isLoggedIn,
  } = useSession()
  const stripePromise = useMemo(
    () => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!),
    []
  )
  const pricingCards: PricingCardWithPriceId[] = useMemo(() => {
    if (!plans || plans.length === 0) return [] as PricingCardWithPriceId[]

    const baseCards = plans.flatMap((plan) =>
      plan.prices
        .filter((price) => price.interval === interval)
        .map((price) => ({
          priceId: price.priceId,
          title: plan.title,
          description: plan.description,
          price: price.unitAmount / 100,
          interval: price.interval,
          features: plan.features,
          actionLabel: plan.features['label'] || 'Get Started',
          subscribed: userSubscription?.plans?.some(
            (p: { priceId: string }) => p.priceId === price.priceId
          ),
        }))
    )

    // Add free plans based on interval
    const freeCards = getFreePlansByInterval(interval)

    return [...freeCards, ...baseCards]
  }, [plans, interval, isLoggedIn])

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
    async (priceId: string) => {
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
      <PricingSwitch onSwitch={setInterval} />
      <section className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-6 mt-10">
        {pricingCards?.map((card) => (
          <PricingCard
            key={card.priceId}
            description={card.description}
            features={card.features}
            handleCheckout={() => handleCheckout(card.priceId)}
            price={card.price}
            title={card.title}
            isFree={card.isFree}
            actionLabel={card.actionLabel}
            subscribed={card.subscribed}
            interval={card.interval}
          />
        ))}
      </section>
    </div>
  )
}
