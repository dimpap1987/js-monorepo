'use client'

import { useCallback, useState } from 'react'
import { useNotifications } from '@js-monorepo/notification'
import { formatForUser } from '@js-monorepo/utils/date'
import { useTimezone } from '@js-monorepo/next/hooks'
import {
  apiCancelSubscription,
  apiCreatePortalSession,
  apiGetSubscription,
  apiRenewSubscription,
  generateIdempotencyKey,
} from '../../utils/api'
import { Subscription } from '../../types'
import { PlanInfo, PaidSubscriptionInfo } from './subscription-management'

interface UseSubscriptionActionsProps {
  plan: PlanInfo | undefined
  subscription: Subscription | null
  paidSubscriptionInfo: PaidSubscriptionInfo | null | undefined
  onCancelSuccess?: () => void
  onRenewSuccess?: () => void
  setPaidSubscriptionData: (data: Subscription | null) => void
}

export function useSubscriptionActions({
  plan,
  subscription,
  paidSubscriptionInfo,
  onCancelSuccess,
  onRenewSuccess,
  setPaidSubscriptionData,
}: UseSubscriptionActionsProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isCancelPaidDialogOpen, setIsCancelPaidDialogOpen] = useState(false)
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPortalLoading, setIsPortalLoading] = useState(false)
  const { addNotification } = useNotifications()
  const userTimezone = useTimezone()

  const periodEnd = subscription?.currentPeriodEnd
    ? formatForUser(subscription.currentPeriodEnd, userTimezone, 'PPP')
    : null

  const handleCancelClick = useCallback(() => {
    setIsCancelDialogOpen(true)
  }, [])

  const handleCancelConfirm = useCallback(async () => {
    if (!plan) return

    setIsLoading(true)
    try {
      const idempotencyKey = generateIdempotencyKey()
      const response = await apiCancelSubscription(plan.priceId, idempotencyKey)

      if (response.ok) {
        addNotification({
          message: 'Subscription canceled',
          description: `Your subscription will end on ${periodEnd}`,
          type: 'success',
        })
        setIsCancelDialogOpen(false)
        onCancelSuccess?.()
      } else {
        addNotification({
          message: 'Failed to cancel subscription',
          description: 'Please try again or contact support',
          type: 'error',
        })
      }
    } catch (error) {
      addNotification({
        message: 'Something went wrong',
        description: 'Please try again later',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [plan, periodEnd, addNotification, onCancelSuccess])

  const handleCancelPaidClick = useCallback(() => {
    setIsCancelPaidDialogOpen(true)
  }, [])

  const handleCancelPaidConfirm = useCallback(async () => {
    if (!paidSubscriptionInfo) return

    setIsLoading(true)
    try {
      const idempotencyKey = generateIdempotencyKey()
      const response = await apiCancelSubscription(paidSubscriptionInfo.priceId, idempotencyKey)

      if (response.ok) {
        let cancelDate: string | null = null
        const refreshResponse = await apiGetSubscription(paidSubscriptionInfo.subscriptionId)
        if (refreshResponse.ok && refreshResponse.data) {
          const subData = refreshResponse.data.subscription
          const updatedSubscription: Subscription = {
            id: subData.id,
            paymentCustomerId: subData.paymentCustomerId,
            stripeSubscriptionId: subData.stripeSubscriptionId || undefined,
            priceId: refreshResponse.data.priceId,
            status: subData.status as Subscription['status'],
            currentPeriodStart: subData.currentPeriodStart || undefined,
            currentPeriodEnd: subData.currentPeriodEnd || undefined,
            trialStart: subData.trialStart || undefined,
            trialEnd: subData.trialEnd || undefined,
            cancelAt: subData.cancelAt || undefined,
            canceledAt: subData.canceledAt || undefined,
            createdAt: subData.createdAt,
            updatedAt: subData.updatedAt,
          }
          setPaidSubscriptionData(updatedSubscription)
          if (updatedSubscription.cancelAt) {
            cancelDate = formatForUser(updatedSubscription.cancelAt, userTimezone, 'PPP')
          }
        }

        addNotification({
          message: 'Paid subscription canceled',
          description: cancelDate
            ? `Your paid subscription will end on ${cancelDate}`
            : 'Your paid subscription has been canceled',
          type: 'success',
        })
        setIsCancelPaidDialogOpen(false)
        onCancelSuccess?.()
      } else {
        addNotification({
          message: 'Failed to cancel paid subscription',
          description: 'Please try again or contact support',
          type: 'error',
        })
      }
    } catch (error) {
      addNotification({
        message: 'Something went wrong',
        description: 'Please try again later',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [paidSubscriptionInfo, userTimezone, addNotification, onCancelSuccess, setPaidSubscriptionData])

  const handleRenewClick = useCallback(() => {
    setIsRenewDialogOpen(true)
  }, [])

  const handleRenewConfirm = useCallback(async () => {
    if (!plan) return

    setIsLoading(true)
    try {
      const idempotencyKey = generateIdempotencyKey()
      const response = await apiRenewSubscription(plan.priceId, idempotencyKey)

      if (response.ok) {
        addNotification({
          message: 'Subscription renewed',
          description: 'Your subscription has been successfully renewed',
          type: 'success',
        })
        setIsRenewDialogOpen(false)
        onRenewSuccess?.()
      } else {
        addNotification({
          message: 'Failed to renew subscription',
          description: 'Please try again or contact support',
          type: 'error',
        })
      }
    } catch (error) {
      addNotification({
        message: 'Something went wrong',
        description: 'Please try again later',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [plan, addNotification, onRenewSuccess])

  const handleManageSubscription = useCallback(async () => {
    setIsPortalLoading(true)
    try {
      const returnUrl = window.location.href
      const response = await apiCreatePortalSession(returnUrl)

      if (response.ok && response.data?.url) {
        window.location.href = response.data.url
      } else {
        addNotification({
          message: 'Failed to open subscription portal',
          description: 'Please try again or contact support',
          type: 'error',
        })
        setIsPortalLoading(false)
      }
    } catch (error) {
      addNotification({
        message: 'Something went wrong',
        description: 'Please try again later',
        type: 'error',
      })
      setIsPortalLoading(false)
    }
  }, [addNotification])

  return {
    isCancelDialogOpen,
    isCancelPaidDialogOpen,
    isRenewDialogOpen,
    isLoading,
    isPortalLoading,
    handleCancelClick,
    handleCancelConfirm,
    handleCancelPaidClick,
    handleCancelPaidConfirm,
    handleRenewClick,
    handleRenewConfirm,
    handleManageSubscription,
    setIsCancelDialogOpen,
    setIsCancelPaidDialogOpen,
    setIsRenewDialogOpen,
  }
}
