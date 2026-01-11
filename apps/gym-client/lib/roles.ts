import { AuthRole } from '@js-monorepo/types/auth'

export type RouteRole = AuthRole | 'PUBLIC'

export const Role = {
  PUBLIC: 'PUBLIC',
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const satisfies Record<string, RouteRole>

/**
 * Role hierarchy - defines which roles inherit permissions from other roles
 * Key: the role | Value: roles it includes (has permissions of)
 *
 * Example: ADMIN includes USER, meaning ADMIN can access USER routes
 */
export const roleHierarchy: Partial<Record<AuthRole, AuthRole[]>> = {
  ADMIN: ['USER'],
}

/**
 * Checks if user has the required role, considering role hierarchy
 *
 * @param userRoles - Roles the user has
 * @param requiredRole - Role required for access
 * @returns true if user has the role directly or through hierarchy
 */
export function hasRequiredRole(userRoles: string[], requiredRole: RouteRole): boolean {
  if (requiredRole === 'PUBLIC') return true

  return userRoles.some((userRole) => {
    // Direct match
    if (userRole === requiredRole) return true

    // Check hierarchy - does userRole inherit requiredRole?
    const inheritedRoles = roleHierarchy[userRole as AuthRole]
    return inheritedRoles?.includes(requiredRole as AuthRole) ?? false
  })
}

/**
 * Checks if user has any of the required roles
 *
 * @param userRoles - Roles the user has
 * @param requiredRoles - Any of these roles grants access
 * @returns true if user has at least one required role
 */
export function hasAnyRequiredRole(userRoles: string[], requiredRoles: RouteRole[]): boolean {
  return requiredRoles.some((role) => hasRequiredRole(userRoles, role))
}
