'use client'

import { useRouter } from 'next-nprogress-bar'

import { useSession } from '@js-monorepo/auth/next/client'
import { DpButton } from '@js-monorepo/button'
import { Tabs, TabsList, TabsTrigger } from '@js-monorepo/components/tabs'
import { PricingPlanType } from '@js-monorepo/types'
import { cn } from '@js-monorepo/ui/util'
import { loadStripe } from '@stripe/stripe-js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  apiCheckoutPlan,
  apiGetPlans,
  freePlanMonth,
  freePlanYear,
} from '../utils/api'

type PricingCardProps = {
  handleCheckout: any
  price: number
  title: string
  description: string
  features: Record<string, string>
  interval?: string
  actionLabel?: string
  popular?: boolean
  active?: boolean
}

type PlansInterval = 'month' | 'year'

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
  popular,
  active,
}: PricingCardProps) => {
  const router = useRouter()
  const { isLoggedIn } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div
      className={cn(
        'relative bg-background-card w-full max-w-[360px] sm:w-[360px] shadow-lg',
        'flex flex-col justify-around p-6 mx-auto text-center rounded-lg border',
        active && isLoggedIn ? 'border-primary' : 'border-border'
      )}
    >
      {active && isLoggedIn && (
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

      {/* Pricing */}
      <div className="flex justify-center items-baseline my-6">
        <span className="mr-2 text-5xl font-extrabold text-gray-900 dark:text-white">
          {`$${price}`}
        </span>

        <span className="text-gray-500 dark:text-gray-400">
          {interval && `/${interval}`}
        </span>
      </div>

      {/* Features List */}
      <ul role="list" className="mb-8 space-y-3 text-left mt-2">
        {Object.entries(features)?.map(([key, value]) => (
          <li key={key} className="flex items-center space-x-3">
            <CheckItem text={value} />
          </li>
        ))}
      </ul>

      {/* Action Button */}
      <DpButton
        size="large"
        loading={isLoading}
        onClick={async () => {
          if (isLoggedIn) {
            setIsLoading(true)
            try {
              await handleCheckout()
            } catch (e) {
              console.error('Stripe Checkout Error:', e)
            }
            setIsLoading(false)
          } else {
            router.push('/auth/login')
          }
        }}
        disabled={active && isLoggedIn}
      >
        {actionLabel}
      </DpButton>
    </div>
  )
}

export function Pricing() {
  const [interval, setInterval] = useState<PlansInterval>('month')
  const [plans, setPlans] = useState<PricingPlanType[]>([])

  const stripePromise = useMemo(
    () => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!),
    []
  )

  const filteredPlans = useMemo(() => {
    if (plans?.length <= 0) return

    const basePlans = plans.filter((plan) => plan.interval === interval)
    if (interval === 'month') {
      return [freePlanMonth, ...basePlans]
    } else if (interval === 'year') {
      return [freePlanYear, ...basePlans]
    }
    return basePlans
  }, [plans, interval])

  useEffect(() => {
    apiGetPlans().then((response) => {
      if (response.ok) {
        setPlans(response.data)
      }
    })
  }, [])

  const handleCheckout = useCallback(
    async (priceId: string) => {
      const response = await apiCheckoutPlan(priceId)
      if (response.ok) {
        const stripe = await stripePromise
        const stripeResponse = await stripe?.redirectToCheckout({
          sessionId: response.data?.sessionId,
        })
        if (stripeResponse?.error) {
          console.error('Stripe Checkout Error:', stripeResponse.error.message)
        }
      }
    },
    [stripePromise]
  )

  return (
    filteredPlans &&
    filteredPlans?.length > 0 && (
      <div>
        <PricingHeader title="Select a Pricing Plan" />
        <PricingSwitch onSwitch={(value) => setInterval(value)} />
        <section className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-6 mt-10">
          {filteredPlans?.map((plan) => {
            return (
              <PricingCard
                handleCheckout={() => handleCheckout(plan.priceId)}
                key={plan.priceId}
                description={plan.description}
                features={plan.features}
                price={plan.price}
                title={plan.title}
                interval={plan.interval}
                actionLabel={plan.features['label'] || 'Get Started'}
                active={plan.active}
              />
            )
          })}
        </section>
      </div>
    )
  )
}
