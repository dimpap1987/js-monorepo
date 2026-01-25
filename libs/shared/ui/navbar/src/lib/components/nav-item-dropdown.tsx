'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@js-monorepo/components/ui/dropdown'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { MenuItem } from '@js-monorepo/types/menu'
import { cn } from '@js-monorepo/ui/util'
import { ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { UserNavProps } from '../navbar'
import { hasRoleAccess } from '@js-monorepo/types/menu'
import { AuthRole } from '@js-monorepo/types/auth'

interface NavItemDropdownProps {
  item: MenuItem
  user?: UserNavProps
}

export const NavItemDropdown = ({ item, user }: NavItemDropdownProps) => {
  const [open, setOpen] = useState(false)

  // Filter children by role access
  const accessibleChildren = useMemo(() => {
    if (!item.children) return []
    return item.children.filter((child) => hasRoleAccess(child.roles, user?.roles as AuthRole[]))
  }, [item.children, user?.roles])

  if (!item.children || accessibleChildren.length === 0) {
    return null
  }

  return (
    <li className={cn('text-center text-nowrap relative content-center self-stretch', item.className)}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          className={cn(
            'p-2 h-full flex items-center gap-1 border-b-2 border-transparent content-center transition-colors',
            item.isAdmin && 'text-primary font-bold',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring'
          )}
        >
          {item.name}
          <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[200px] p-2">
          {/* Parent link */}
          <DropdownMenuItem asChild className="cursor-pointer hover:bg-secondary focus:bg-secondary">
            <DpNextNavLink href={item.href} className="flex items-center gap-2 w-full" onClick={() => setOpen(false)}>
              {item.Icon && <item.Icon className="h-4 w-4" />}
              {item.name}
            </DpNextNavLink>
          </DropdownMenuItem>
          {/* Children links */}
          {accessibleChildren.map((child) => (
            <DropdownMenuItem
              key={child.href}
              asChild
              className="cursor-pointer hover:bg-secondary focus:bg-secondary p-2"
            >
              <DpNextNavLink
                href={child.href}
                className="flex items-center gap-2 w-full"
                onClick={() => setOpen(false)}
              >
                {child.Icon && <child.Icon className="h-4 w-4" />}
                {child.name}
              </DpNextNavLink>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}
