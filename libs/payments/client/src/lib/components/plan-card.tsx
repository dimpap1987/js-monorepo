import { DpButton } from '@js-monorepo/button'
import { ConfirmationDialog } from '@js-monorepo/dialog'
import { cn } from '@js-monorepo/ui/util'
import moment from 'moment'
import { PropsWithChildren, useRef, useState } from 'react'
import { HiOutlineDotsVertical } from 'react-icons/hi'
import { useClickAway } from 'react-use'
import {
  PlanCardActionsType,
  PlanCardContainerType,
  PlanCardContentType,
  PlanCardProps,
} from '../types'

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
      <div className="content bg-background-card py-6 px-3 sm:px-6 rounded-xl flex flex-col justify-around text-center w-full">
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

export function PlanCardActions({
  isSubscribed,
  isLoading,
  isLoggedIn,
  isFree,
  onCheckout,
  onCancel,
  actionLabel = 'Get Started',
  status,
}: PlanCardActionsType) {
  const [isDialogOpen, setDialogOpen] = useState(false)
  if (!isLoggedIn) {
    return (
      <DpButton size="large" loading={isLoading} onClick={onCheckout}>
        <div className="text-base whitespace-break-spaces">Get Started</div>
      </DpButton>
    )
  }

  if (isFree) {
    return (
      <div
        className="h-10 rounded-md px-8 bg-primary [text-shadow:1px_0px_1px_hsl(var(--tw-shadow-color))]
                 text-white flex items-center justify-center font-semibold"
      >
        <div className="text-base whitespace-break-spaces">Free Plan</div>
      </div>
    )
  }

  if (isSubscribed && status === 'canceled') {
    return (
      <DpButton
        size="large"
        className="w-full"
        loading={isLoading}
        onClick={onCheckout}
      >
        <div className="text-base whitespace-break-spaces">Renew</div>
      </DpButton>
    )
  }

  return isSubscribed ? (
    <>
      <DpButton
        size="large"
        variant="danger"
        className="w-full"
        onClick={() => setDialogOpen(true)}
      >
        <div className="text-base whitespace-break-spaces">
          Cancel Subscription
        </div>
      </DpButton>
      <ConfirmationDialog
        isOpen={isDialogOpen}
        title="Cancel subscription"
        content="Are you sure you want to procceed ?"
        onClose={(yes) => {
          setDialogOpen(false)
          if (yes) {
            onCancel?.()
          }
        }}
      />
    </>
  ) : (
    <DpButton
      size="large"
      className="w-full"
      loading={isLoading}
      onClick={onCheckout}
      disabled={isSubscribed || isFree}
    >
      <div className="text-base whitespace-break-spaces">{actionLabel}</div>
    </DpButton>
  )
}

export const PlanInfo = ({ children }: PropsWithChildren) => {
  const [isOpen, setIsOpen] = useState(false)
  const infoContentRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const toggleInfo = () => setIsOpen((prev) => !prev)

  useClickAway(infoContentRef, (event) => {
    if (buttonRef?.current?.contains(event.target as Node)) {
      return
    }
    setIsOpen(false)
  })

  return (
    <div>
      <div className="absolute right-4 top-7">
        <button
          ref={buttonRef}
          onClick={toggleInfo}
          aria-label="Toggle subscription info"
        >
          <HiOutlineDotsVertical size={26} />
        </button>
      </div>
      {/* Info dropdown */}
      {isOpen && (
        <div
          ref={infoContentRef}
          className="absolute right top-16 w-[90%] rounded-lg bg-white shadow-xl p-4"
        >
          <div className="text-sm text-gray-600 space-y-1">{children}</div>
        </div>
      )}
    </div>
  )
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
  currentPeriodEnd,
  status = 'default',
  handleCancelSubscription,
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
  const formattedDate = moment(currentPeriodEnd).format('YYYY-MM-DD')
  const formattedTime = moment(currentPeriodEnd).format('hh:mm A')

  return (
    <PlanCardContainer
      anySubscribed={anySubscribed}
      isFree={isFree}
      subscribed={subscribed}
    >
      <ActiveSubscriptionLabel subscribed={subscribed} />

      {subscribed && (
        <PlanInfo>
          <ol>
            {status === 'active' && (
              <li>
                Your <strong>{title}</strong> will renew automatically on{' '}
                <strong>{formattedDate}</strong> at{' '}
                <strong>{formattedTime}</strong>. <br /> Want to make changes?
                You can cancel your subscription anytime before the renewal
                date.
              </li>
            )}
            {status === 'canceled' && (
              <li>
                Your <strong>{title}</strong> plan have been cancelled so after
                the <strong>{formattedDate}</strong> at{' '}
                <strong>{formattedTime}</strong>, you will lose the benefits
              </li>
            )}
          </ol>
        </PlanInfo>
      )}

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
        onCancel={handleCancelSubscription}
      ></PlanCardActions>
    </PlanCardContainer>
  )
}
