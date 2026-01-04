'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { useMemo } from 'react'
import { SessionSubscription } from '../../types'
import { getPlanHierarchy, hasPlanAccess, hasPlanAccessForAny } from './plan-hierarchy'

export interface PlanAccessResult {
  /** Whether the user has access to the required plan */
  hasAccess: boolean
  /** The user's current plan name (null if not subscribed) */
  currentPlan: string | null
  /** Whether the user has any active subscription */
  isSubscribed: boolean
  /** Whether the user is on a trial */
  isTrial: boolean
  /** The hierarchy level of the user's current plan */
  currentHierarchy: number
  /** The hierarchy level of the required plan */
  requiredHierarchy: number
}

/**
 * Hook to check if the current user has access to a specific plan level.
 *
 * @param requiredPlan - The minimum plan required for access (e.g., 'basic', 'pro')
 * @param options - Additional options for access control
 * @returns PlanAccessResult with access status and plan details
 *
 * @example
 * ```tsx
 * function ProFeature() {
 *   const { hasAccess, currentPlan } = usePlanAccess('pro')
 *
 *   if (!hasAccess) return <UpgradePrompt currentPlan={currentPlan} />
 *
 *   return <ProFeatureContent />
 * }
 * ```
 */
export function usePlanAccess(
  requiredPlan: string,
  options: {
    /** Include users currently on trial as having access */
    includeTrial?: boolean
  } = {}
): PlanAccessResult {
  const { includeTrial = true } = options
  const { session } = useSession()

  return useMemo(() => {
    const subscription = session?.subscription as SessionSubscription | undefined
    const currentPlan = subscription?.plan ?? null
    const isSubscribed = subscription?.isSubscribed ?? false
    const isTrial = subscription?.isTrial ?? false

    // If user is on trial and we don't include trials, deny access
    const effectivelySubscribed = isSubscribed && (includeTrial || !isTrial)

    const hasAccess = effectivelySubscribed && hasPlanAccess(currentPlan, requiredPlan)

    return {
      hasAccess,
      currentPlan,
      isSubscribed,
      isTrial,
      currentHierarchy: getPlanHierarchy(currentPlan),
      requiredHierarchy: getPlanHierarchy(requiredPlan),
    }
  }, [session, requiredPlan, includeTrial])
}

/**
 * Hook to check if the current user has access to any of the specified plans.
 * Useful for features available on multiple specific plans.
 *
 * @param requiredPlans - Array of plan names that grant access
 * @param options - Additional options for access control
 * @returns PlanAccessResult with access status and plan details
 *
 * @example
 * ```tsx
 * function MultiPlanFeature() {
 *   const { hasAccess } = usePlanAccessForPlans(['pro', 'enterprise'])
 *
 *   if (!hasAccess) return null
 *   return <ExclusiveFeature />
 * }
 * ```
 */
export function usePlanAccessForPlans(
  requiredPlans: string[],
  options: {
    /** Include users currently on trial as having access */
    includeTrial?: boolean
    /** If true, user must meet ALL plans (highest hierarchy required) */
    requireAll?: boolean
  } = {}
): PlanAccessResult {
  const { includeTrial = true, requireAll = false } = options
  const { session } = useSession()

  return useMemo(() => {
    const subscription = session?.subscription as SessionSubscription | undefined
    const currentPlan = subscription?.plan ?? null
    const isSubscribed = subscription?.isSubscribed ?? false
    const isTrial = subscription?.isTrial ?? false

    const effectivelySubscribed = isSubscribed && (includeTrial || !isTrial)

    const hasAccess = effectivelySubscribed && hasPlanAccessForAny(currentPlan, requiredPlans, requireAll)

    const requiredHierarchy = requireAll
      ? Math.max(...requiredPlans.map(getPlanHierarchy))
      : Math.min(...requiredPlans.map(getPlanHierarchy))

    return {
      hasAccess,
      currentPlan,
      isSubscribed,
      isTrial,
      currentHierarchy: getPlanHierarchy(currentPlan),
      requiredHierarchy: requiredPlans.length > 0 ? requiredHierarchy : 0,
    }
  }, [session, requiredPlans, includeTrial, requireAll])
}
