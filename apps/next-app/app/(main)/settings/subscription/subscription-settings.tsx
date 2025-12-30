'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { Skeleton } from '@js-monorepo/components/skeleton'
import {
  apiGetSubscription,
  SessionSubscription,
  Subscription,
  SubscriptionManagement,
  usePlans,
} from '@js-monorepo/payments-ui'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SettingsItem } from '../settings-items'

export function SubscriptionSettings() {
  const { session, refreshSession } = useSession()
  const { data: plans = [], isLoading: isLoadingPlans } = usePlans()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)

  const sessionSubscription = session?.subscription as SessionSubscription | undefined
  const subscriptionPlan = sessionSubscription?.plans?.[0]

  // Fetch full subscription details
  useEffect(() => {
    async function fetchSubscription() {
      if (!subscriptionPlan?.subscriptionId) {
        setIsLoadingSubscription(false)
        return
      }

      try {
        const response = await apiGetSubscription(subscriptionPlan.subscriptionId)
        if (response.ok) {
          setSubscription(response.data as Subscription)
        }
      } catch (error) {
        console.error('Error fetching subscription:', error)
      } finally {
        setIsLoadingSubscription(false)
      }
    }

    fetchSubscription()
  }, [subscriptionPlan?.subscriptionId])

  // Get plan details from the plans list
  const planDetails = useMemo(() => {
    if (!subscription || !plans.length) return null

    for (const plan of plans) {
      const price = plan.prices.find((p) => p.id === subscription.priceId)
      if (price) {
        return {
          name: plan.name,
          price: price.unitAmount / 100,
          interval: price.interval,
          features: plan.features || {},
          priceId: price.id,
        }
      }
    }
    return null
  }, [subscription, plans])

  const handleCancelSuccess = useCallback(() => {
    // Refresh session to update subscription status
    refreshSession()
    // Refetch subscription data
    if (subscriptionPlan?.subscriptionId) {
      apiGetSubscription(subscriptionPlan.subscriptionId).then((response) => {
        if (response.ok) {
          setSubscription(response.data as Subscription)
        }
      })
    }
  }, [refreshSession, subscriptionPlan?.subscriptionId])

  const isLoading = isLoadingPlans || isLoadingSubscription

  return (
    <section className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="mb-2">Subscription</h2>
        <p className="text-sm text-foreground-muted">Manage your subscription and billing preferences</p>
      </div>

      {/* Subscription Management */}
      <SettingsItem label="Current Plan">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-6 w-24" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        ) : (
          <SubscriptionManagement
            subscription={subscription}
            planName={planDetails?.name || 'Unknown'}
            planPrice={planDetails?.price || 0}
            planInterval={planDetails?.interval || 'month'}
            planFeatures={planDetails?.features || {}}
            priceId={planDetails?.priceId || 0}
            onCancelSuccess={handleCancelSuccess}
          />
        )}
      </SettingsItem>
    </section>
  )
}
