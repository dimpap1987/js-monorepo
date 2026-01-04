/**
 * Plan hierarchy configuration for client-side plan comparison.
 * Higher values indicate higher-tier plans with more features.
 *
 * This should match the hierarchy values in the database Products table.
 * When a user has a plan with hierarchy >= required hierarchy, they have access.
 *
 * Example: A "pro" user (hierarchy: 2) can access "basic" features (hierarchy: 1)
 */
export const PLAN_HIERARCHY: Record<string, number> = {
  free: 0,
  basic: 1,
  pro: 2,
  premium: 3,
  enterprise: 4,
} as const

export type PlanName = keyof typeof PLAN_HIERARCHY

/**
 * Get the hierarchy value for a plan name.
 * Returns 0 for unknown plans (treated as free/no plan).
 */
export function getPlanHierarchy(plan: string | null | undefined): number {
  if (!plan) return 0
  const normalizedPlan = plan.toLowerCase()
  return PLAN_HIERARCHY[normalizedPlan] ?? 0
}

/**
 * Check if a user's plan meets or exceeds the required plan level.
 *
 * @param userPlan - The user's current plan name
 * @param requiredPlan - The minimum required plan name
 * @returns true if user has sufficient access
 *
 * @example
 * ```ts
 * // Pro user can access basic features
 * hasPlanAccess('pro', 'basic') // true
 *
 * // Basic user cannot access pro features
 * hasPlanAccess('basic', 'pro') // false
 * ```
 */
export function hasPlanAccess(userPlan: string | null | undefined, requiredPlan: string): boolean {
  const userHierarchy = getPlanHierarchy(userPlan)
  const requiredHierarchy = getPlanHierarchy(requiredPlan)
  return userHierarchy >= requiredHierarchy
}

/**
 * Check if a user's plan meets any of the required plans.
 * Useful for features that are available on multiple specific plans.
 *
 * @param userPlan - The user's current plan name
 * @param requiredPlans - Array of plan names that grant access
 * @param requireAll - If true, user must meet ALL plans (uses highest hierarchy)
 * @returns true if user has sufficient access
 */
export function hasPlanAccessForAny(
  userPlan: string | null | undefined,
  requiredPlans: string[],
  requireAll = false
): boolean {
  if (requiredPlans.length === 0) return true

  const userHierarchy = getPlanHierarchy(userPlan)

  if (requireAll) {
    // User must meet the highest required plan
    const maxRequired = Math.max(...requiredPlans.map(getPlanHierarchy))
    return userHierarchy >= maxRequired
  }

  // User meets any of the required plans (lowest is sufficient)
  const minRequired = Math.min(...requiredPlans.map(getPlanHierarchy))
  return userHierarchy >= minRequired
}
