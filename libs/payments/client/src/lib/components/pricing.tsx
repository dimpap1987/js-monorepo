'use client'

import { useRouter } from 'next-nprogress-bar'

import { useSession } from '@js-monorepo/auth/next/client'
import { DpButton } from '@js-monorepo/button'
import { Tabs, TabsList, TabsTrigger } from '@js-monorepo/components/tabs'
import { cn } from '@js-monorepo/ui/util'
import { loadStripe } from '@stripe/stripe-js'
import { useEffect, useState } from 'react'

type PricingCardProps = {
  handleCheckout: any
  priceIdMonthly: any
  priceIdYearly: any
  isYearly?: boolean
  title: string
  monthlyPrice?: number
  yearlyPrice?: number
  description: string
  features: string[]
  actionLabel: string
  popular?: boolean
  active?: boolean
}

type PricingSwitchProps = {
  onSwitch: (value: string) => void
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
    <h1
      className={`text-2xl sm:text-2xl md:text-3xl lg:text-4xl mt-2 font-semibold tracking-tight`}
    >
      {title}
    </h1>
    <br />
  </section>
)

const PricingSwitch = ({ onSwitch }: PricingSwitchProps) => (
  <Tabs
    defaultValue="0"
    className="max-w-max mx-auto dark:bg-gray-800 p-2 mt-2 rounded-lg"
    onValueChange={onSwitch}
  >
    <TabsList className="p1">
      <TabsTrigger value="0" className="font-semibold text-lg">
        <p>Monthly</p>
      </TabsTrigger>
      <TabsTrigger value="1" className="font-semibold text-lg">
        <p>Yearly</p>
      </TabsTrigger>
    </TabsList>
  </Tabs>
)

const PricingCard = ({
  handleCheckout,
  isYearly,
  title,
  priceIdMonthly,
  priceIdYearly,
  monthlyPrice,
  yearlyPrice,
  description,
  features,
  actionLabel,
  popular,
  active,
}: PricingCardProps) => {
  const router = useRouter()
  const { isLoggedIn } = useSession()
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
          {isYearly && yearlyPrice
            ? `$${yearlyPrice}`
            : monthlyPrice
              ? `$${monthlyPrice}`
              : '0'}
        </span>

        <span className="text-gray-500 dark:text-gray-400">
          {isYearly ? '/year' : '/month'}
        </span>
      </div>

      {/* Features List */}
      <ul role="list" className="mb-8 space-y-3 text-left mt-2">
        {features.map((feature: string) => (
          <li key={feature} className="flex items-center space-x-3">
            <CheckItem text={feature} />
          </li>
        ))}
      </ul>

      {/* Action Button */}
      <DpButton
        size="large"
        onClick={() => {
          if (isLoggedIn) {
            handleCheckout(isYearly ? priceIdYearly : priceIdMonthly, true)
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
  const [isYearly, setIsYearly] = useState<boolean>(false)
  const togglePricingPeriod = (value: string) =>
    setIsYearly(parseInt(value) === 1)
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null)

  useEffect(() => {
    setStripePromise(
      loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
    )
  }, [])

  const handleCheckout = async (priceId: string, subscription: boolean) => {
    alert('Not implemented yet 😔')

    // try {
    //   const { data } = await axios.post(`/api/payments/create-checkout-session`,
    //     { userId: user?.id, email: user?.emailAddresses?.[0]?.emailAddress, priceId, subscription });
    //   if (data.sessionId) {
    //     const stripe = await stripePromise;
    //     const response = await stripe?.redirectToCheckout({
    //       sessionId: data.sessionId,
    //     });
    //     return response
    //   } else {
    //     console.error('Failed to create checkout session');
    //     toast('Failed to create checkout session')
    //     return
    //   }
    // } catch (error) {
    //   console.error('Error during checkout:', error);
    //   toast('Error during checkout')
    //   return
  }

  const plans = [
    {
      title: 'Free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: 'Essential features you need to get started',
      features: ['Example Feature Number 1'],
      priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 1,
      priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 2,
      actionLabel: 'Get Started',
      active: true,
    },
    {
      title: 'Basic',
      monthlyPrice: 10,
      yearlyPrice: 100,
      description: 'Essential features you need to get started',
      features: ['Example Feature Number 1', 'Example Feature Number 2'],
      priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 1,
      priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 2,
      actionLabel: 'Get Started',
    },
    {
      title: 'Pro',
      monthlyPrice: 25,
      yearlyPrice: 250,
      description: 'Perfect for owners of small & medium businessess',
      features: [
        'Example Feature Number 1',
        'Example Feature Number 2',
        'Example Feature Number 3',
      ],
      actionLabel: 'Get Started',
      priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 3,
      priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 4,
      popular: true,
    },
  ]

  return (
    <div>
      <PricingHeader title="Select a Pricing Plan" />
      <PricingSwitch onSwitch={togglePricingPeriod} />
      <section className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-6 mt-10">
        {plans.map((plan) => {
          return (
            <PricingCard
              handleCheckout={handleCheckout}
              key={plan.title}
              {...plan}
              isYearly={isYearly}
            />
          )
        })}
      </section>
    </div>
  )
}
