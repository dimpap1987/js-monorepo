export type AuthRole = 'ADMIN' | 'USER'

export type MenuItem = {
  name: string
  href: string
  Icon?: any
  roles: (AuthRole | 'PUBLIC')[]
  className?: string
  // Optional flags for additional visibility conditions
  requiresOrganizer?: boolean
  requiresParticipant?: boolean
}

/**
 * Role hierarchy: ADMIN > USER
 * Returns all roles that the given role includes (e.g., ADMIN includes USER)
 */
export function getEffectiveRoles(userRoles: AuthRole[]): AuthRole[] {
  const effectiveRoles = new Set<AuthRole>(userRoles)

  // ADMIN inherits USER permissions
  if (effectiveRoles.has('ADMIN')) {
    effectiveRoles.add('USER')
  }

  return Array.from(effectiveRoles)
}

/**
 * Check if user has access to a menu item based on role hierarchy
 */
export function hasRoleAccess(itemRoles: (AuthRole | 'PUBLIC')[], userRoles?: AuthRole[]): boolean {
  // PUBLIC items are accessible to everyone
  if (itemRoles.includes('PUBLIC')) return true

  // No user roles means no access to non-public items
  if (!userRoles || userRoles.length === 0) return false

  // Get effective roles (with hierarchy)
  const effectiveRoles = getEffectiveRoles(userRoles)

  // Check if any effective role matches item roles
  return itemRoles.some((role) => effectiveRoles.includes(role as AuthRole))
}
