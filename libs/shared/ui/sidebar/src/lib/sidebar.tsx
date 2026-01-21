'use client'
import { Button } from '@js-monorepo/components/ui/button'
import { Separator } from '@js-monorepo/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@js-monorepo/components/ui/sidebar'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { UserMetadata } from '@js-monorepo/navbar'
import { AuthRole, SessionUserType } from '@js-monorepo/types/auth'
import { hasRoleAccess, MenuItem } from '@js-monorepo/types/menu'
import { cn } from '@js-monorepo/ui/util'
import { ChevronRight, X } from 'lucide-react'
import { memo, ReactNode, useMemo, useState } from 'react'

export type SidebarPositionType = 'right' | 'left'

export interface DpNextSidebarProps {
  readonly children?: ReactNode
  readonly items: MenuItem[]
  readonly header?: string
  readonly user?: Partial<SessionUserType>
  readonly plan?: string | null
  readonly className?: string
}

const MenuSideBarItem = memo(
  ({ item, onClose, user }: { item: MenuItem; onClose: () => void; user?: Partial<SessionUserType> }) => {
    const [isOpen, setIsOpen] = useState(false)

    // Filter children by role access
    const accessibleChildren = useMemo(() => {
      if (!item.children) return []
      return item.children.filter((child) => hasRoleAccess(child.roles, user?.roles as AuthRole[]))
    }, [item.children, user?.roles])

    // If item has children, render collapsible item
    if (item.children && accessibleChildren.length > 0) {
      return (
        <SidebarMenuItem className="w-full min-w-0">
          <SidebarMenuButton
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'flex items-center gap-3 text-base py-3 px-6 w-full h-full min-w-0 max-w-full tracking-wide transition-colors',
              item.isAdmin && 'text-primary font-bold hover:text-primary/80',
              isOpen ? 'h-auto' : 'h-full'
            )}
            data-state={isOpen ? 'open' : 'closed'}
          >
            {item.Icon && <item.Icon className={cn('h-5 w-5 shrink-0', item.isAdmin && 'text-primary')} />}
            <span className="flex-1 text-left min-w-0 truncate">{item.name}</span>
            <ChevronRight className={cn('h-4 w-4 shrink-0 transition-transform duration-200', isOpen && 'rotate-90')} />
          </SidebarMenuButton>
          {isOpen && (
            <SidebarMenuSub className="w-full min-w-0 mt-1">
              {/* Parent link */}
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild>
                  <DpNextNavLink href={item.href} onClick={onClose}>
                    {item.Icon && <item.Icon className="h-4 w-4" />}
                    <span>{item.name}</span>
                  </DpNextNavLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              {/* Children links */}
              {accessibleChildren.map((child) => (
                <SidebarMenuSubItem key={child.href} className="py-1">
                  <SidebarMenuSubButton asChild>
                    <DpNextNavLink href={child.href} onClick={onClose}>
                      {child.Icon && <child.Icon className="h-4 w-4" />}
                      <span>{child.name}</span>
                    </DpNextNavLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      )
    }

    // Regular sidebar item without children
    return (
      <SidebarMenuItem className="w-full min-w-0">
        <SidebarMenuButton asChild className="h-full">
          <DpNextNavLink
            href={item.href}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 text-base py-3 px-6 w-full min-w-0 max-w-full tracking-wide transition-colors',
              item.isAdmin && 'text-primary font-bold hover:text-primary/80'
            )}
          >
            {item.Icon && <item.Icon className={cn('h-5 w-5 shrink-0', item.isAdmin && 'text-primary')} />}
            <span className="text-left min-w-0 truncate flex-1">{item.name}</span>
          </DpNextNavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }
)

MenuSideBarItem.displayName = 'MenuSideBarItem'

const DpNextSidebarBase = ({ children, user, plan, items = [], header, className }: DpNextSidebarProps) => {
  const { setOpenMobile } = useSidebar()

  // Split items by position and filter by role access
  const { mainItems, secondaryItems } = useMemo(() => {
    const accessible = items.filter((item) => hasRoleAccess(item.roles, user?.roles as AuthRole[]))
    return {
      mainItems: accessible.filter((item) => item.position !== 'secondary'),
      secondaryItems: accessible.filter((item) => item.position === 'secondary'),
    }
  }, [items, user?.roles])

  return (
    <Sidebar side="right" variant="inset" collapsible="offcanvas" className={className}>
      <SidebarHeader className="border-b border-border">
        <div className={cn('flex items-center justify-between mt-4 py-2 px-2')}>
          {user && (
            <UserMetadata
              profileImage={user.profile?.image}
              username={user.username}
              createdAt={user.createdAt}
              plan={plan}
              className="select-none text-sm p-0"
            />
          )}
        </div>
        {header && <span className="text-sm font-semibold">dadsad</span>}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpenMobile(false)}
          className="md:hidden absolute top-2 right-2"
          aria-label="close sidebar"
        >
          <X className="h-5 w-5" />
        </Button>
      </SidebarHeader>

      {/* Main Items (top) */}
      <SidebarContent className="flex-1">
        <SidebarMenu>
          {mainItems.map((item) => (
            <MenuSideBarItem key={item.href} item={item} onClose={() => setOpenMobile(false)} user={user} />
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Secondary Items (bottom) */}
      {secondaryItems.length > 0 && (
        <>
          <Separator className="my-2" />
          <SidebarContent className="flex-none">
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <MenuSideBarItem key={item.href} item={item} onClose={() => setOpenMobile(false)} user={user} />
              ))}
            </SidebarMenu>
          </SidebarContent>
        </>
      )}

      {children && (
        <>
          <Separator className="my-4" />
          <SidebarFooter className="mb-3">
            <div className="w-full text-center">{children}</div>
          </SidebarFooter>
        </>
      )}
    </Sidebar>
  )
}

export const DpNextSidebar = memo(DpNextSidebarBase)
