'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { cn } from '@js-monorepo/ui/util'
import { Crown, Lock, Sparkles } from 'lucide-react'
import React, { ReactNode, useMemo } from 'react'
import { SessionSubscription } from '../../types'
import { PlanBadge } from '../plan-badge'
import { hasPlanAccess, hasPlanAccessForAny } from './plan-hierarchy'

export type PlanGateMode =
  /** Completely hide content when user doesn't have access */
  | 'hide'
  /** Show content with blur overlay and upgrade prompt */
  | 'blur'
  /** Show locked state with upgrade prompt */
  | 'lock'
  /** Show custom fallback content */
  | 'fallback'

export interface PlanGateProps {
  /** Required plan(s) to access the content */
  plan: string | string[]
  /** Content to render when user has access */
  children: ReactNode
  /** Display mode when user doesn't have access */
  mode?: PlanGateMode
  /** Custom fallback content for 'fallback' mode */
  fallback?: ReactNode
  /** Include users on trial as having access */
  includeTrial?: boolean
  /** If multiple plans provided, require ALL plans (uses highest hierarchy) */
  requireAll?: boolean
  /** Custom upgrade URL (defaults to /pricing) */
  upgradeUrl?: string
  /** Custom message to show in lock/blur modes */
  message?: string
  /** Feature name to display in the upgrade prompt */
  featureName?: string
  /** Additional className for the wrapper */
  className?: string
  /** Additional className for the locked/blur overlay */
  overlayClassName?: string
  /** Callback when upgrade button is clicked */
  onUpgradeClick?: () => void
}

function BlurredContent({
  requiredPlan,
  upgradeUrl,
  message,
  featureName,
  className,
  overlayClassName,
  children,
  onUpgradeClick,
}: OverlayContentProps) {
  const defaultMessage = featureName ? `Upgrade to unlock ${featureName}` : 'Upgrade your plan to access this feature'

  return (
    <div className={cn('relative', className)}>
      {/* Blurred content */}
      <div className="pointer-events-none select-none blur-sm" aria-hidden="true">
        {children}
      </div>

      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          'bg-background/60 backdrop-blur-[2px]',
          'rounded-lg',
          overlayClassName
        )}
      >
        <div className="flex flex-col items-center gap-3 text-center p-4 max-w-xs">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">{message || defaultMessage}</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Requires</span>
              <PlanBadge plan={requiredPlan} size="sm" />
            </div>
          </div>
          <DpNextNavLink
            href={upgradeUrl}
            onClick={onUpgradeClick}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-md',
              'bg-primary text-primary-foreground',
              'text-sm font-medium',
              'hover:bg-primary/90 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
            )}
          >
            <Crown className="w-4 h-4" />
            Upgrade Now
          </DpNextNavLink>
        </div>
      </div>
    </div>
  )
}

function LockedContent({
  requiredPlan,
  upgradeUrl,
  message,
  featureName,
  className,
  overlayClassName,
  onUpgradeClick,
}: Omit<OverlayContentProps, 'children'>) {
  const defaultMessage = featureName ? `${featureName} is a premium feature` : 'This is a premium feature'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 p-6',
        'border border-dashed border-border rounded-lg',
        'bg-muted/30',
        'text-center',
        className,
        overlayClassName
      )}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
        <Lock className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-foreground">{message || defaultMessage}</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Available on</span>
          <PlanBadge plan={requiredPlan} size="sm" />
        </div>
      </div>
      <DpNextNavLink
        href={upgradeUrl}
        onClick={onUpgradeClick}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-md',
          'bg-primary text-primary-foreground',
          'text-sm font-medium',
          'hover:bg-primary/90 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
        )}
      >
        <Crown className="w-4 h-4" />
        View Plans
      </DpNextNavLink>
    </div>
  )
}

/**
 * A wrapper component that controls access to content based on subscription plan.
 * Supports multiple display modes for professional UX when users don't have access.
 *
 * @example
 * ```tsx
 * // Hide content completely
 * <PlanGate plan="pro" mode="hide">
 *   <ProOnlyFeature />
 * </PlanGate>
 *
 * // Show blurred preview with upgrade prompt
 * <PlanGate plan="pro" mode="blur" featureName="Advanced Analytics">
 *   <AnalyticsDashboard />
 * </PlanGate>
 *
 * // Show lock icon with upgrade prompt
 * <PlanGate plan="basic" mode="lock" featureName="Export Reports">
 *   <ExportButton />
 * </PlanGate>
 *
 * // Custom fallback content
 * <PlanGate plan="pro" mode="fallback" fallback={<UpgradeCard />}>
 *   <ProFeature />
 * </PlanGate>
 * ```
 */
export function PlanGate({
  plan,
  children,
  mode = 'hide',
  fallback = null,
  includeTrial = true,
  requireAll = false,
  upgradeUrl = '/pricing',
  message,
  featureName,
  className,
  overlayClassName,
  onUpgradeClick,
}: PlanGateProps) {
  const { session } = useSession()

  const { hasAccess, requiredPlan, currentPlan, isSubscribed } = useMemo(() => {
    const subscription = session?.subscription as SessionSubscription | undefined
    const userPlan = subscription?.plan ?? null
    const subscribed = subscription?.isSubscribed ?? false
    const isTrial = subscription?.isTrial ?? false

    const effectivelySubscribed = subscribed && (includeTrial || !isTrial)

    const plans = Array.isArray(plan) ? plan : [plan]
    const access = effectivelySubscribed && hasPlanAccessForAny(userPlan, plans, requireAll)

    // Get the display plan name (highest required if requireAll, lowest otherwise)
    const displayPlan = requireAll ? plans.reduce((a, b) => (a > b ? a : b)) : plans.reduce((a, b) => (a < b ? a : b))

    return { hasAccess: access, requiredPlan: displayPlan, currentPlan: userPlan, isSubscribed: subscribed }
  }, [session, plan, includeTrial, requireAll])

  // User has access - render children
  if (hasAccess) {
    return <div className={cn(className)}>{children}</div>
  }

  // User doesn't have access - handle based on mode
  switch (mode) {
    case 'hide':
      return null

    case 'fallback':
      return <>{fallback}</>

    case 'blur':
      return (
        <BlurredContent
          requiredPlan={requiredPlan}
          upgradeUrl={upgradeUrl}
          message={message}
          featureName={featureName}
          className={className}
          overlayClassName={overlayClassName}
          onUpgradeClick={onUpgradeClick}
        >
          {children}
        </BlurredContent>
      )

    case 'lock':
      return (
        <LockedContent
          requiredPlan={requiredPlan}
          upgradeUrl={upgradeUrl}
          message={message}
          featureName={featureName}
          className={className}
          overlayClassName={overlayClassName}
          onUpgradeClick={onUpgradeClick}
        />
      )

    default:
      return null
  }
}

interface OverlayContentProps {
  requiredPlan: string
  upgradeUrl: string
  message?: string
  featureName?: string
  className?: string
  overlayClassName?: string
  children?: ReactNode
  onUpgradeClick?: () => void
}

export type PlanGateInlineBehavior =
  /** Disable the element (grayed out, not clickable) */
  | 'disable'
  /** Element looks normal, click is silently blocked */
  | 'block'
  /** Element looks normal, click redirects to upgrade page */
  | 'redirect'

export interface PlanGateInlineProps {
  /** Required plan to access the feature */
  plan: string
  /** The element to wrap (e.g., Button) */
  children: React.ReactElement<{
    disabled?: boolean
    children?: ReactNode
    onClick?: (e: React.MouseEvent) => void
  }>
  /** Behavior when user doesn't have access */
  behavior?: PlanGateInlineBehavior
  /** Include users on trial as having access */
  includeTrial?: boolean
  /** Show the plan badge on the element */
  showBadge?: boolean
  /** Custom upgrade URL for 'redirect' behavior */
  upgradeUrl?: string
  /** Additional className for the badge */
  badgeClassName?: string
  /** Callback when blocked click occurs */
  onBlockedClick?: (plan: string) => void
}

/**
 * Wrapper for inline elements (buttons, menu items) that controls access based on plan.
 *
 * @example
 * ```tsx
 * // Redirect to pricing on click (default)
 * <PlanGateInline plan="pro">
 *   <Button>Export Data</Button>
 * </PlanGateInline>
 *
 * // Disable the button
 * <PlanGateInline plan="pro" behavior="disable">
 *   <Button>Export Data</Button>
 * </PlanGateInline>
 *
 * // Block click silently with custom handler
 * <PlanGateInline plan="pro" behavior="block" onBlockedClick={() => toast('Upgrade required')}>
 *   <Button>Export Data</Button>
 * </PlanGateInline>
 * ```
 */
export function PlanGateInline({
  plan,
  children,
  behavior = 'redirect',
  includeTrial = true,
  showBadge = true,
  upgradeUrl = '/pricing',
  badgeClassName,
  onBlockedClick,
}: PlanGateInlineProps) {
  const { session } = useSession()

  const hasAccess = useMemo(() => {
    const subscription = session?.subscription as SessionSubscription | undefined
    if (!subscription?.isSubscribed) return false

    const isTrial = subscription?.isTrial ?? false
    const effectivelySubscribed = includeTrial || !isTrial

    if (!effectivelySubscribed) return false
    return hasPlanAccess(subscription.plan, plan)
  }, [session, plan, includeTrial])

  // User has access - render children unchanged
  if (hasAccess) {
    return children
  }

  const badge = showBadge ? <PlanBadge plan={plan} size="sm" className={cn('ml-2', badgeClassName)} /> : null

  // Handle click interception for non-disable behaviors
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    onBlockedClick?.(plan)

    if (behavior === 'redirect') {
      window.location.href = upgradeUrl
    }
  }

  // Behavior: disable - traditional disabled state
  if (behavior === 'disable') {
    return React.cloneElement(children, {
      disabled: true,
      children: (
        <>
          {children.props.children}
          {badge}
        </>
      ),
    })
  }

  // Behavior: block or redirect - intercept clicks
  return React.cloneElement(children, {
    onClick: handleClick,
    children: (
      <>
        {children.props.children}
        {badge}
      </>
    ),
  })
}
