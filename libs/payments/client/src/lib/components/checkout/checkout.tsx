'use client'

import { DpButton } from '@js-monorepo/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { useNotifications } from '@js-monorepo/notification'
import { loadStripe } from '@stripe/stripe-js/pure'
import { ArrowLeft, Lock } from 'lucide-react'
import { useRouter } from 'next-nprogress-bar'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePlans } from '../../queries/payments-queries'
import { POPULAR_PLAN_NAME, PricingCardData } from '../../types'
import { apiCheckoutPlan, generateIdempotencyKey } from '../../utils/api'
import { CheckoutOrderSummary } from './checkout-order-summary'
import { CheckoutPlanComparison } from './checkout-plan-comparison'

export function Checkout() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addNotification } = useNotifications()
  const stripePromise = useMemo(() => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''), [])

  const planIdParam = searchParams?.get('planId')
  const initialPlanId = planIdParam ? parseInt(planIdParam, 10) : null

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(initialPlanId)
  const [isProcessing, setIsProcessing] = useState(false)
  const idempotencyKeyRef = useRef<string>(generateIdempotencyKey())

  const { data: plans = [], isLoading: isLoadingPlans } = usePlans()

  // Transform plans to PricingCardData format
  const pricingCards: PricingCardData[] = useMemo(() => {
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
            metadata: plan.metadata,
            isPopular: plan.name.toLowerCase() === POPULAR_PLAN_NAME,
          }))
      )
      .sort((a, b) => a.price - b.price)
  }, [plans])

  // Find the selected plan
  const selectedPlan = useMemo(() => {
    return pricingCards.find((p) => p.id === selectedPlanId)
  }, [pricingCards, selectedPlanId])

  // Update selectedPlanId when URL param changes or when plans load
  useEffect(() => {
    if (initialPlanId && pricingCards.length > 0) {
      const planExists = pricingCards.some((p) => p.id === initialPlanId)
      if (planExists) {
        setSelectedPlanId(initialPlanId)
      } else {
        // Redirect to pricing if plan doesn't exist
        router.push('/pricing')
      }
    }
  }, [initialPlanId, pricingCards, router])

  // Auth is handled by middleware - /checkout requires USER or ADMIN role
  // No additional auth check needed here

  const handlePlanChange = useCallback((planId: number) => {
    setSelectedPlanId(planId)
    // Generate new idempotency key when plan changes
    idempotencyKeyRef.current = generateIdempotencyKey()
  }, [])

  const handleCheckout = useCallback(async () => {
    if (!selectedPlanId) return

    setIsProcessing(true)
    try {
      const response = await apiCheckoutPlan(selectedPlanId, idempotencyKeyRef.current)
      if (response.ok) {
        const stripe = await stripePromise
        const stripeResponse = await stripe?.redirectToCheckout({
          sessionId: response.data.sessionId,
        })
        if (stripeResponse?.error) {
          console.error('Stripe Checkout Error:', stripeResponse.error.message)
          addNotification({
            message: 'Payment Error',
            description: stripeResponse.error.message || 'Failed to redirect to payment',
            type: 'error',
          })
        }
      } else {
        addNotification({
          message: 'Something went wrong',
          description: 'Please try again later',
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Checkout Error:', error)
      addNotification({
        message: 'Something went wrong',
        description: 'Please try again later',
        type: 'error',
      })
    } finally {
      setIsProcessing(false)
    }
  }, [selectedPlanId, stripePromise, addNotification])

  // Loading state
  if (isLoadingPlans) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // No plan selected
  if (!selectedPlan) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-foreground mb-4">No plan selected</h2>
        <DpNextNavLink href="/pricing">
          <DpButton>View Plans</DpButton>
        </DpNextNavLink>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back Link */}
      <DpNextNavLink
        href="/pricing"
        className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground mb-3 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to pricing</span>
      </DpNextNavLink>

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Complete your purchase</h1>
        <p className="text-foreground-neutral mt-2">Review your order and proceed to secure payment</p>
      </div>

      {/* Main Content - Two columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column - Order Summary */}
        <div className="lg:col-span-3 space-y-6">
          <CheckoutOrderSummary plan={selectedPlan} className="h-auto" />

          {/* Security Note */}
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <Lock className="w-4 h-4" />
            <span>Secure checkout powered by Stripe</span>
          </div>

          {/* Continue Button (desktop) */}
          <div className="hidden lg:block">
            <DpButton className="w-full" size="large" loading={isProcessing} onClick={handleCheckout}>
              Continue to Payment
            </DpButton>
          </div>
        </div>

        {/* Right Column - Plan Comparison */}
        <div className="lg:col-span-2">
          <CheckoutPlanComparison
            plans={pricingCards}
            selectedPlanId={selectedPlanId as number}
            onSelectPlan={handlePlanChange}
          />
        </div>
      </div>

      {/* Mobile Continue Button */}
      <div className="lg:hidden mt-8 sticky bottom-4">
        <DpButton className="w-full shadow-lg" size="large" loading={isProcessing} onClick={handleCheckout}>
          Continue to Payment
        </DpButton>
      </div>
    </div>
  )
}
