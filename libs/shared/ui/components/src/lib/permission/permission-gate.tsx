'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { ReactNode } from 'react'
import { cn } from '@js-monorepo/ui/util'

export interface PermissionGateProps {
  permission: string | string[]
  fallback?: ReactNode
  children: ReactNode
  requireAll?: boolean // If true, requires ALL permissions; if false, requires ANY
  className?: string
}

export function PermissionGate({
  permission,
  fallback = null,
  children,
  requireAll = false,
  className,
}: PermissionGateProps) {
  const { session } = useSession()
  const userPermissions = session?.user?.permissions || []
  const userRoles = session?.user?.roles || []

  // Convert permission to array
  const requiredPermissions = Array.isArray(permission) ? permission : [permission]

  // Check if user has required permissions
  const hasPermission = requireAll
    ? requiredPermissions.every((p) => userPermissions.includes(p) || userRoles.includes(p))
    : requiredPermissions.some((p) => userPermissions.includes(p) || userRoles.includes(p))

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <div className={cn(className)}>{children}</div>
}

/**
 * Hook to check if user has a specific permission
 *
 * @example
 * ```tsx
 * const canDelete = usePermission('users.delete')
 *
 * {canDelete && <Button onClick={handleDelete}>Delete</Button>}
 * ```
 */
export function usePermission(permission: string | string[], requireAll = false): boolean {
  const { session } = useSession()
  const userPermissions = session?.user?.permissions || []
  const userRoles = session?.user?.roles || []

  const requiredPermissions = Array.isArray(permission) ? permission : [permission]

  return requireAll
    ? requiredPermissions.every((p) => userPermissions.includes(p) || userRoles.includes(p))
    : requiredPermissions.some((p) => userPermissions.includes(p) || userRoles.includes(p))
}
