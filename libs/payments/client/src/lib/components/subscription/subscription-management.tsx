'use client'

import { DpButton } from '@js-monorepo/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { useNotifications } from '@js-monorepo/notification'
import { Calendar, CheckCircle, CreditCard, RefreshCw, Settings, XCircle } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Subscription } from '../../types'
import {
  apiCancelSubscription,
  apiCreatePortalSession,
  apiRenewSubscription,
  generateIdempotencyKey,
} from '../../utils/api'
import { CancelSubscriptionDialog } from './cancel-subscription-dialog'
import { RenewSubscriptionDialog } from './renew-subscription-dialog'

interface SubscriptionManagementProps {
  subscription: Subscription | null
  planName: string
  planPrice: number
  planInterval: string
  planFeatures: Record<string, string>
  priceId: number
  onCancelSuccess?: () => void
  onRenewSuccess?: () => void
}

type SubscriptionStatus = 'active' | 'canceling' | 'canceled' | 'none'

function getSubscriptionStatus(subscription: Subscription | null): SubscriptionStatus {
  if (!subscription) return 'none'
  // Check canceled status first - cancelAt may still have a value after expiration
  if (subscription.status === 'canceled') return 'canceled'
  // Subscription is scheduled to cancel but still active
  if (subscription.cancelAt || subscription.canceledAt) return 'canceling'
  return 'active'
}

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const config = {
    active: {
      label: 'Active',
      className: 'bg-status-success-bg text-status-success border-status-success',
      icon: CheckCircle,
    },
    canceling: {
      label: 'Cancels Soon',
      className: 'bg-status-warning-bg text-status-warning border-status-warning',
      icon: XCircle,
    },
    canceled: {
      label: 'Canceled',
      className: 'bg-status-error-bg text-status-error border-status-error',
      icon: XCircle,
    },
    none: {
      label: 'No Subscription',
      className: 'bg-background-secondary text-foreground-muted border-border',
      icon: XCircle,
    },
  }

  const { label, className, icon: Icon } = config[status]

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}

export function SubscriptionManagement({
  subscription,
  planName,
  planPrice,
  planInterval,
  planFeatures,
  priceId,
  onCancelSuccess,
  onRenewSuccess,
}: SubscriptionManagementProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPortalLoading, setIsPortalLoading] = useState(false)
  const { addNotification } = useNotifications()

  const status = getSubscriptionStatus(subscription)

  const periodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const cancelAt = subscription?.cancelAt
    ? new Date(subscription.cancelAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const handleCancelClick = useCallback(() => {
    setIsCancelDialogOpen(true)
  }, [])

  const handleCancelConfirm = useCallback(async () => {
    setIsLoading(true)
    try {
      const idempotencyKey = generateIdempotencyKey()
      const response = await apiCancelSubscription(priceId, idempotencyKey)

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
  }, [priceId, periodEnd, addNotification, onCancelSuccess])

  const handleRenewClick = useCallback(() => {
    setIsRenewDialogOpen(true)
  }, [])

  const handleRenewConfirm = useCallback(async () => {
    setIsLoading(true)
    try {
      const idempotencyKey = generateIdempotencyKey()
      const response = await apiRenewSubscription(priceId, idempotencyKey)

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
  }, [priceId, addNotification, onRenewSuccess])

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

  // No subscription state
  if (status === 'none' || status === 'canceled') {
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background-secondary">
          <CreditCard className="h-8 w-8 text-foreground-muted" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Active Subscription</h3>
        <p className="text-foreground-neutral mb-6">
          You're currently on the free plan. Upgrade to unlock premium features.
        </p>
        <DpNextNavLink href="/pricing">
          <DpButton>View Plans</DpButton>
        </DpNextNavLink>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-xl font-semibold text-foreground capitalize">{planName} Plan</h3>
            <StatusBadge status={status} />
          </div>
          <p className="text-2xl font-bold text-foreground">
            €{planPrice}
            <span className="text-base font-normal text-foreground-neutral">/{planInterval}</span>
          </p>
        </div>
      </div>

      {/* Billing Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        {status === 'canceling' && cancelAt ? (
          <div className="flex items-start gap-3 rounded-lg border border-status-warning bg-status-warning-bg p-4">
            <XCircle className="h-5 w-5 shrink-0 text-status-warning mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Cancellation scheduled</p>
              <p className="text-sm text-foreground-neutral">Your access ends on {cancelAt}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-lg border border-border bg-background-secondary p-4">
            <Calendar className="h-5 w-5 shrink-0 text-foreground-muted mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Next billing date</p>
              <p className="text-sm text-foreground-neutral">{periodEnd || 'N/A'}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 rounded-lg border border-border bg-background-secondary p-4">
          <CreditCard className="h-5 w-5 shrink-0 text-foreground-muted mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Payment method</p>
            <p className="text-sm text-foreground-neutral">Managed by Stripe</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2 justify-end">
        <DpButton variant="outline" onClick={handleManageSubscription} loading={isPortalLoading}>
          <Settings className="h-4 w-4 mr-2" />
          Manage
        </DpButton>
        {status === 'canceling' && (
          <DpButton variant="primary" onClick={handleRenewClick}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Renew
          </DpButton>
        )}
        {status === 'active' && (
          <DpButton variant="ghost" className="text-status-error hover:text-status-error" onClick={handleCancelClick}>
            Cancel Subscription
          </DpButton>
        )}
      </div>

      {/* Cancel Dialog */}
      <CancelSubscriptionDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleCancelConfirm}
        isLoading={isLoading}
        subscription={subscription}
        planName={planName}
        features={planFeatures}
      />

      {/* Renew Dialog */}
      <RenewSubscriptionDialog
        isOpen={isRenewDialogOpen}
        onClose={() => setIsRenewDialogOpen(false)}
        onConfirm={handleRenewConfirm}
        isLoading={isLoading}
        subscription={subscription}
        planName={planName}
      />
    </div>
  )
}
