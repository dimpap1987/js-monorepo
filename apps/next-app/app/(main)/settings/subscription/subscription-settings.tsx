'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { Skeleton } from '@js-monorepo/components/skeleton'
import { useWebSocketEvent } from '@js-monorepo/next/providers'
import {
  apiGetSubscription,
  InvoiceHistory,
  SessionSubscription,
  Subscription,
  SubscriptionManagement,
  usePlans,
} from '@js-monorepo/payments-ui'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SettingsItem } from '../settings-items'

export function SubscriptionSettings() {
  const { session, refreshSession } = useSession()
  const { data: plans = [], isLoading: isLoadingPlans } = usePlans()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)
  const subscriptionIdRef = useRef<number | null>(null)

  const sessionSubscription = session?.subscription as SessionSubscription | undefined

  // Keep track of subscription ID for WebSocket refetch
  useEffect(() => {
    subscriptionIdRef.current = sessionSubscription?.subscriptionId ?? null
  }, [sessionSubscription?.subscriptionId])

  // Refetch subscription when WebSocket refresh event fires (after webhook processes)
  useWebSocketEvent('events:refresh-session', () => {
    if (subscriptionIdRef.current) {
      apiGetSubscription(subscriptionIdRef.current).then((response) => {
        if (response.ok) {
          setSubscription(response.data as Subscription)
        }
      })
    }
  })

  // Fetch full subscription details on mount and when subscriptionId changes
  useEffect(() => {
    async function fetchSubscription() {
      if (!sessionSubscription?.subscriptionId) {
        setIsLoadingSubscription(false)
        return
      }

      try {
        const response = await apiGetSubscription(sessionSubscription.subscriptionId)
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
  }, [sessionSubscription?.subscriptionId])

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

  const refetchSubscription = useCallback(() => {
    refreshSession()
    if (sessionSubscription?.subscriptionId) {
      apiGetSubscription(sessionSubscription.subscriptionId).then((response) => {
        if (response.ok) {
          setSubscription(response.data as Subscription)
        }
      })
    }
  }, [refreshSession, sessionSubscription?.subscriptionId])

  const handleCancelSuccess = refetchSubscription
  const handleRenewSuccess = refetchSubscription

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
            onRenewSuccess={handleRenewSuccess}
          />
        )}
      </SettingsItem>

      {/* Invoice History */}
      <SettingsItem label="Invoice History">
        <InvoiceHistory />
      </SettingsItem>
    </section>
  )
}
