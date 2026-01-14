'use client'

import { useEffect, useState } from 'react'
import { Subscription } from '../../types'
import { SubscriptionStatus as SubscriptionStatusEnum } from '@js-monorepo/types/subscription'
import { apiGetSubscription } from '../../utils/api'
import { PaidSubscriptionInfo } from './subscription-management'

interface UsePaidSubscriptionProps {
  subscription: Subscription | null
  paidSubscriptionInfo: PaidSubscriptionInfo | null | undefined
  isTrial: boolean
}

export function usePaidSubscription({ subscription, paidSubscriptionInfo, isTrial }: UsePaidSubscriptionProps) {
  const [paidSubscriptionData, setPaidSubscriptionData] = useState<Subscription | null>(null)
  const [isLoadingPaidSubscription, setIsLoadingPaidSubscription] = useState(false)

  useEffect(() => {
    // Early return: If user is NOT on a trial (isTrial: false),
    // the active subscription IS the paid subscription - no need to fetch
    if (!isTrial) {
      setPaidSubscriptionData(null)
      setIsLoadingPaidSubscription(false)
      return
    }

    // If user is on a trial, check if they have a separate paid subscription
    if (!paidSubscriptionInfo || !paidSubscriptionInfo.subscriptionId) {
      setPaidSubscriptionData(null)
      setIsLoadingPaidSubscription(false)
      return
    }

    // If active subscription IS the paid subscription (IDs match), use it directly
    if (subscription?.id === paidSubscriptionInfo.subscriptionId) {
      setPaidSubscriptionData(subscription)
      setIsLoadingPaidSubscription(false)
      return
    }

    // Only fetch if user is on trial AND has a separate paid subscription (different IDs)
    async function fetchPaidSubscription() {
      if (!paidSubscriptionInfo?.subscriptionId) {
        setPaidSubscriptionData(null)
        setIsLoadingPaidSubscription(false)
        return
      }

      setIsLoadingPaidSubscription(true)
      try {
        const response = await apiGetSubscription(paidSubscriptionInfo.subscriptionId)
        if (response.ok && response.data) {
          const subData = response.data.subscription
          setPaidSubscriptionData({
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
        } else {
          setPaidSubscriptionData(null)
        }
      } catch (error) {
        console.error('Error fetching paid subscription:', error)
        setPaidSubscriptionData(null)
      } finally {
        setIsLoadingPaidSubscription(false)
      }
    }

    fetchPaidSubscription()
  }, [isTrial, paidSubscriptionInfo, subscription])

  return { paidSubscriptionData, isLoadingPaidSubscription, setPaidSubscriptionData }
}
