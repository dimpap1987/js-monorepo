'use client'

import { centsToAmount } from '@js-monorepo/currency'
import { useSession } from '@js-monorepo/auth/next/client'
import { Skeleton } from '@js-monorepo/components/ui/skeleton'
import { useWebSocketEvent } from '@js-monorepo/next/providers'
import {
  apiGetSubscription,
  InvoiceHistory,
  PlanInfo,
  SessionSubscription,
  Subscription,
  SubscriptionManagement,
  usePlans,
} from '@js-monorepo/payments-ui'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { SettingsItem } from '../settings-items'
import { BackArrowWithLabel } from '@js-monorepo/back-arrow'

export function SubscriptionSettings() {
  const t = useTranslations()
  const { session, refreshSession } = useSession()
  const { data: plans = [], isLoading: isLoadingPlans } = usePlans()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)
  const [subscriptionPlan, setSubscriptionPlan] = useState<PlanInfo | null>(null)
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
        if (response.ok && response.data) {
          // Extract subscription from structured response
          const subData = response.data.subscription
          const priceData = response.data.price
          setSubscription({
            id: subData.id,
            paymentCustomerId: subData.paymentCustomerId,
            stripeSubscriptionId: subData.stripeSubscriptionId || undefined,
            priceId: response.data.priceId,
            status: subData.status as Subscription['status'],
            currentPeriodStart: subData.currentPeriodStart || undefined,
            currentPeriodEnd: subData.currentPeriodEnd || undefined,
            trialStart: subData.trialStart || undefined,
            trialEnd: subData.trialEnd || undefined,
            cancelAt: subData.cancelAt || undefined,
            canceledAt: subData.canceledAt || undefined,
            createdAt: subData.createdAt,
            updatedAt: subData.updatedAt,
          })
          if (priceData) {
            setSubscriptionPlan({
              name: priceData.product.name,
              price: centsToAmount(priceData.unitAmount),
              priceInCents: priceData.unitAmount,
              currency: priceData.currency,
              interval: priceData.interval,
              // We don't have feature metadata on this response; fall back to empty.
              features: {},
              priceId: priceData.id,
            })
          }
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
        if (response.ok && response.data) {
          // Extract subscription from structured response
          const subData = response.data.subscription
          const priceData = response.data.price
          setSubscription({
            id: subData.id,
            paymentCustomerId: subData.paymentCustomerId,
            stripeSubscriptionId: subData.stripeSubscriptionId || undefined,
            priceId: response.data.priceId,
            status: subData.status as Subscription['status'],
            currentPeriodStart: subData.currentPeriodStart || undefined,
            currentPeriodEnd: subData.currentPeriodEnd || undefined,
            trialStart: subData.trialStart || undefined,
            trialEnd: subData.trialEnd || undefined,
            cancelAt: subData.cancelAt || undefined,
            canceledAt: subData.canceledAt || undefined,
            createdAt: subData.createdAt,
            updatedAt: subData.updatedAt,
          })
          if (priceData) {
            setSubscriptionPlan({
              name: priceData.product.name,
              price: centsToAmount(priceData.unitAmount),
              priceInCents: priceData.unitAmount,
              currency: priceData.currency,
              interval: priceData.interval,
              features: {},
              priceId: priceData.id,
            })
          }
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
  const planDetails = useMemo<PlanInfo | null>(() => {
    if (!subscription) return null
    return subscriptionPlan
  }, [subscription, subscriptionPlan])

  const refetchSubscription = useCallback(() => {
    refreshSession()
    if (sessionSubscription?.subscriptionId) {
      apiGetSubscription(sessionSubscription.subscriptionId).then((response) => {
        if (response.ok && response.data) {
          // Extract subscription from structured response
          const subData = response.data.subscription
          const priceData = response.data.price
          setSubscription({
            id: subData.id,
            paymentCustomerId: subData.paymentCustomerId,
            stripeSubscriptionId: subData.stripeSubscriptionId || undefined,
            priceId: response.data.priceId,
            status: subData.status as Subscription['status'],
            currentPeriodStart: subData.currentPeriodStart || undefined,
            currentPeriodEnd: subData.currentPeriodEnd || undefined,
            trialStart: subData.trialStart || undefined,
            trialEnd: subData.trialEnd || undefined,
            cancelAt: subData.cancelAt || undefined,
            canceledAt: subData.canceledAt || undefined,
            createdAt: subData.createdAt,
            updatedAt: subData.updatedAt,
          })
          if (priceData) {
            setSubscriptionPlan({
              name: priceData.product.name,
              price: centsToAmount(priceData.unitAmount),
              priceInCents: priceData.unitAmount,
              currency: priceData.currency,
              interval: priceData.interval,
              features: {},
              priceId: priceData.id,
            })
          }
        }
      })
    }
  }, [refreshSession, sessionSubscription?.subscriptionId])

  const handleCancelSuccess = refetchSubscription
  const handleRenewSuccess = refetchSubscription

  const isLoading = isLoadingPlans || isLoadingSubscription

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <BackArrowWithLabel>
        <h2 className="mb-2">{t('settings.subscription.title')}</h2>
        <p className="text-sm text-foreground-muted">{t('settings.subscription.description')}</p>
      </BackArrowWithLabel>

      {/* Subscription Management */}
      <SettingsItem label={t('settings.subscription.currentPlan')}>
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
            activeSubscription={
              subscription && planDetails
                ? {
                    subscription,
                    plan: {
                      name: planDetails.name,
                      price: planDetails.price,
                      priceInCents: planDetails.priceInCents,
                      currency: planDetails.currency,
                      interval: planDetails.interval,
                      features: planDetails.features || {},
                      priceId: planDetails.priceId,
                    },
                  }
                : null
            }
            paidSubscription={
              sessionSubscription?.hasPaidSubscription &&
              sessionSubscription?.paidSubscriptionId &&
              sessionSubscription?.paidSubscriptionPriceId &&
              sessionSubscription?.paidSubscriptionPlan
                ? {
                    subscriptionId: sessionSubscription.paidSubscriptionId,
                    priceId: sessionSubscription.paidSubscriptionPriceId,
                    planName: sessionSubscription.paidSubscriptionPlan,
                  }
                : null
            }
            onCancelSuccess={handleCancelSuccess}
            onRenewSuccess={handleRenewSuccess}
          />
        )}
      </SettingsItem>

      {/* Invoice History */}
      <SettingsItem label={t('settings.subscription.invoiceHistory')}>
        <InvoiceHistory />
      </SettingsItem>
    </section>
  )
}
