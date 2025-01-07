import { DpButton } from '@js-monorepo/button'
import { cn } from '@js-monorepo/ui/util'
import { PropsWithChildren, useState } from 'react'

export type PlanCardContainerType = {
  anySubscribed?: boolean
  subscribed?: boolean
  isFree?: boolean
}

export function PlanCardContainer({
  anySubscribed,
  subscribed,
  isFree,
  children,
}: PlanCardContainerType & PropsWithChildren) {
  return (
    <div
      className={cn(
        'relative w-full max-w-[360px] sm:w-[360px] shadow-lg flex mx-auto rounded-xl border-2 border-border transform transition-transform duration-300',
        anySubscribed && !subscribed && 'opacity-55',
        subscribed && 'glow',
        anySubscribed && !isFree && 'hover:opacity-100'
      )}
    >
      <div className="content bg-background-card p-6 rounded-xl flex flex-col justify-around text-center w-full">
        {children}
      </div>
    </div>
  )
}

export function ActiveSubscriptionLabel({
  subscribed,
}: {
  subscribed: boolean
}) {
  return (
    subscribed && (
      <div
        className="bg-green-50 text-green-600 absolute top-0 
                -translate-y-1/2 right-5 z-10 p-1.5 px-3 border border-green-400 
                rounded-full shadow-md font-medium"
      >
        Active
      </div>
    )
  )
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

type PlanCardContentType = {
  title: string
  description: string
  price: number
  interval: string
  features: Record<string, string>
}

export function PlanCardContent({
  title,
  description,
  price,
  interval,
  features,
}: PlanCardContentType) {
  return (
    <>
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
            <CheckItem text={value as string} />
          </li>
        ))}
      </ul>
    </>
  )
}

type PlanCardActionsType = {
  isSubscribed?: boolean
  isLoading?: boolean
  isLoggedIn?: boolean
  isFree?: boolean
  onCheckout?: () => Promise<any>
  actionLabel?: string
}

export function PlanCardActions({
  isSubscribed,
  isLoading,
  isLoggedIn,
  isFree,
  onCheckout,
  actionLabel = 'Get Started',
}: PlanCardActionsType) {
  if (!isLoggedIn) {
    return (
      <DpButton size="large" loading={isLoading} onClick={onCheckout}>
        Get Started
      </DpButton>
    )
  }

  return isSubscribed || isFree ? (
    <div
      className="h-10 rounded-md px-8 bg-primary [text-shadow:1px_0px_1px_hsl(var(--tw-shadow-color))]
                 text-white flex items-center justify-center font-semibold"
    >
      {isSubscribed ? 'Current Plan' : 'Free Plan'}
    </div>
  ) : (
    <DpButton
      size="large"
      loading={isLoading}
      onClick={onCheckout}
      disabled={isSubscribed || isFree}
    >
      {actionLabel}
    </DpButton>
  )
}

export type PlanCardProps = {
  handleCheckout?: () => Promise<any>
  price: number
  title: string
  description: string
  features: Record<string, string>
  interval: string
  actionLabel?: string
  popular?: boolean
  subscribed: boolean
  anySubscribed?: boolean
  isLoggedIn?: boolean
}

export const PlanCard = ({
  handleCheckout,
  title,
  price,
  interval,
  description,
  features,
  actionLabel,
  subscribed,
  anySubscribed,
  isLoggedIn,
}: PlanCardProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const isFree = price === 0

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
    <PlanCardContainer
      anySubscribed={anySubscribed}
      isFree={isFree}
      subscribed={subscribed}
    >
      <ActiveSubscriptionLabel subscribed={subscribed} />

      <PlanCardContent
        title={title}
        description={description}
        price={price}
        interval={interval}
        features={features}
      ></PlanCardContent>

      <PlanCardActions
        isFree={isFree}
        isLoading={isLoading}
        isLoggedIn={isLoggedIn}
        isSubscribed={subscribed}
        onCheckout={onCheckout}
        actionLabel={actionLabel}
      ></PlanCardActions>
    </PlanCardContainer>
  )
}
