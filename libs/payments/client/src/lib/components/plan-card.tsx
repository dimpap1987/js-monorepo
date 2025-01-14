import { DpButton } from '@js-monorepo/button'
import { ConfirmationDialog } from '@js-monorepo/dialog'
import { cn } from '@js-monorepo/ui/util'
import moment from 'moment'

import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useRef,
  useState,
} from 'react'
import { HiOutlineDotsVertical } from 'react-icons/hi'
import { MdCancel } from 'react-icons/md'
import { useClickAway } from 'react-use'
import {
  PlanCardActionsType,
  PlanCardContainerType,
  PlanCardContentType,
  PlanCardProps,
  Subscription,
} from '../types'

function getSubscriptionMessage({
  subscription,
  name,
}: {
  subscription: Subscription
  name: string
}) {
  if (!subscription) return null

  switch (subscription.status) {
    case 'active':
      return subscription.cancelAt ? (
        <li>
          Your <strong className="capitalize">{name}</strong> will be canceled
          at the end of the period{' '}
          <strong>{moment(subscription.cancelAt).format('YYYY-MM-DD')}</strong>{' '}
          at <strong>{moment(subscription.cancelAt).format('hh:mm A')}</strong>.
          <br />
        </li>
      ) : (
        <li>
          Your <strong className="capitalize">{name}</strong> will renew
          automatically on{' '}
          <strong>
            {moment(subscription.currentPeriodEnd).format('YYYY-MM-DD')}
          </strong>{' '}
          at{' '}
          <strong>
            {moment(subscription.currentPeriodEnd).format('hh:mm A')}
          </strong>
          .
          <br />
          You can cancel your subscription anytime before the renewal date.
        </li>
      )
    case 'trialing':
      return (
        <li>
          You're currently on a <strong>trial</strong> for the{' '}
          <strong className="capitalize">{name}</strong>. Your trial will end on{' '}
          <strong>{moment(subscription.trialEnd).format('YYYY-MM-DD')}</strong>{' '}
          at <strong>{moment(subscription.trialEnd).format('hh:mm A')}</strong>.{' '}
          <br />
          To continue enjoying the benefits, ensure you subscribe before the
          trial ends.
        </li>
      )
    case 'canceled':
      return (
        <li>
          Your <strong className="capitalize">{name}</strong> plan has been
          cancelled. Date of Cancellation:{' '}
          <strong>{moment(subscription.cancelAt).format('YYYY-MM-DD')}</strong>{' '}
          at <strong>{moment(subscription.cancelAt).format('hh:mm A')}</strong>,
        </li>
      )
    default:
      return null
  }
}

export function CancelActionButton({
  setDialogOpen,
  isDialogOpen,
  onCancel,
  className,
}: {
  isDialogOpen: boolean
  setDialogOpen: Dispatch<SetStateAction<boolean>>
  onCancel?: () => Promise<any>
  className?: string
}) {
  return (
    <>
      <DpButton
        variant="danger"
        size="small"
        className={cn('rounded-full p-0', className)}
        onClick={() => setDialogOpen(true)}
      >
        <div className="text-base whitespace-break-spaces">
          <MdCancel size={26} />
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
  )
}

export function PlanCardContainer({
  anySubscribed,
  subscribed,
  isFree,
  children,
  isLoggedIn,
}: PlanCardContainerType & PropsWithChildren) {
  return (
    <div
      className={cn(
        'relative w-full max-w-[340px] sm:w-[340px] shadow-lg flex mx-auto rounded-xl border border-border transform transition-transform duration-300',
        anySubscribed && !subscribed && 'opacity-55',
        isLoggedIn && isFree && !anySubscribed && 'border-accent',
        subscribed && 'glow',
        anySubscribed && !isFree && 'hover:opacity-100'
      )}
    >
      <div className="content bg-background-card py-10 px-3 sm:px-6 rounded-xl flex flex-col text-center w-full">
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

const renderSubscribedActions = (
  sub: Subscription,
  isLoading: boolean,
  isDialogOpen: boolean,
  setDialogOpen: Dispatch<SetStateAction<boolean>>,
  onCheckout?: () => Promise<any>,
  onCancel?: () => Promise<any>
) => {
  switch (sub.status) {
    case 'active':
      return sub.cancelAt ? (
        <DpButton
          size="large"
          className="w-full"
          loading={isLoading}
          onClick={onCheckout}
        >
          <span className="text-base whitespace-break-spaces">Renew</span>
        </DpButton>
      ) : (
        <div>
          <div className="h-10 rounded-md px-8 bg-background border border-border text-foreground flex items-center justify-center font-semibold shadow-md relative">
            <span className="text-base whitespace-break-spaces">
              Current Plan
            </span>
            <CancelActionButton
              className="absolute right-3"
              isDialogOpen={isDialogOpen}
              onCancel={onCancel}
              setDialogOpen={setDialogOpen}
            />
          </div>
        </div>
      )
    case 'trialing':
      return (
        <DpButton
          size="large"
          className="w-full"
          loading={isLoading}
          onClick={onCheckout}
        >
          <span className="text-base whitespace-break-spaces">Renew</span>
        </DpButton>
      )
    default:
      return (
        <CancelActionButton
          isDialogOpen={isDialogOpen}
          onCancel={onCancel}
          setDialogOpen={setDialogOpen}
        />
      )
  }
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
      <h1 className="mb-4 capitalize">{title}</h1>
      <p className="font-light text-foreground-neutral sm:text-lg">
        {description}
      </p>
      <div className="flex justify-center items-baseline my-6">
        <h1 className="mr-1 font-extrabold text-gray-900 dark:text-white inline-block">
          {`€${price}`}
        </h1>

        <h2 className="text-gray-500 dark:text-gray-400 ">
          {interval && `/${interval}`}
        </h2>
      </div>
      <ul role="list" className="mb-8 space-y-2 text-left mt-2 text-sm">
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
  subscription,
}: PlanCardActionsType) {
  const [isDialogOpen, setDialogOpen] = useState(false)

  if (!isLoggedIn) {
    return (
      <DpButton
        className="w-full"
        size="large"
        loading={isLoading}
        onClick={onCheckout}
      >
        <span className="text-base whitespace-break-spaces">{actionLabel}</span>
      </DpButton>
    )
  }

  if (isFree) {
    return (
      <div className="h-10 rounded-md px-8 bg-background border border-border text-foreground flex items-center justify-center font-semibold shadow-md">
        <span className="text-base whitespace-break-spaces">Free Plan</span>
      </div>
    )
  }

  return isSubscribed && subscription ? (
    renderSubscribedActions(
      subscription,
      isLoading,
      isDialogOpen,
      setDialogOpen,
      onCheckout,
      onCancel
    )
  ) : (
    <DpButton
      size="large"
      className="w-full"
      loading={isLoading}
      onClick={onCheckout}
      disabled={isSubscribed || isFree}
    >
      <span className="text-base whitespace-break-spaces">{actionLabel}</span>
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
          className="absolute right top-20 w-[90%] rounded-lg bg-white shadow-xl p-4"
        >
          <div className="text-sm text-gray-600 space-y-1">{children}</div>
        </div>
      )}
    </div>
  )
}

export const PlanCard = ({
  handleCheckout,
  name,
  price,
  interval,
  description,
  features,
  actionLabel,
  subscribed,
  anySubscribed,
  isLoggedIn,
  subscription,
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

  return (
    <PlanCardContainer
      anySubscribed={anySubscribed}
      isFree={isFree}
      subscribed={subscribed}
      isLoggedIn={isLoggedIn}
    >
      <ActiveSubscriptionLabel subscribed={subscribed} />

      {subscribed && (
        <PlanInfo>
          <ol>
            {(subscription?.status === 'active' ||
              subscription?.status === 'trialing' ||
              subscription?.status === 'canceled') &&
              getSubscriptionMessage({
                subscription,
                name: `${name} plan`,
              })}
          </ol>
        </PlanInfo>
      )}

      <PlanCardContent
        title={`${name} plan`}
        description={description}
        price={price}
        interval={interval}
        features={features}
      ></PlanCardContent>

      <div className="mt-auto">
        <PlanCardActions
          isFree={isFree}
          isLoading={isLoading}
          isLoggedIn={isLoggedIn}
          isSubscribed={subscribed}
          onCheckout={onCheckout}
          actionLabel={actionLabel}
          onCancel={handleCancelSubscription}
          subscription={subscription}
        ></PlanCardActions>
      </div>
    </PlanCardContainer>
  )
}
