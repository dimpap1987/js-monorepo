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
  useSidebar,
} from '@js-monorepo/components/ui/sidebar'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { UserMetadata } from '@js-monorepo/navbar'
import { AuthRole, SessionUserType } from '@js-monorepo/types/auth'
import { MenuItem, hasRoleAccess } from '@js-monorepo/types/menu'
import { cn } from '@js-monorepo/ui/util'
import { X } from 'lucide-react'
import { memo, ReactNode, useMemo } from 'react'

export type SidebarPositionType = 'right' | 'left'

export interface DpNextSidebarProps {
  readonly children?: ReactNode
  readonly items: MenuItem[]
  readonly header?: string
  readonly user?: Partial<SessionUserType>
  readonly plan?: string | null
  readonly className?: string
}

const MenuSideBarItem = memo(({ item, onClose }: { item: MenuItem; onClose: () => void }) => (
  <SidebarMenuItem>
    <SidebarMenuButton asChild>
      <DpNextNavLink
        href={item.href}
        onClick={onClose}
        className={cn(
          'flex items-end flex-row-reverse gap-3 text-base p-3 px-5 w-full h-full tracking-wide transition-colors',
          item.isAdmin && 'text-primary font-bold hover:text-primary/80'
        )}
      >
        {item.Icon && <item.Icon className={cn('h-5 w-5 self-center', item.isAdmin && 'text-primary')} />}
        <span>{item.name}</span>
      </DpNextNavLink>
    </SidebarMenuButton>
  </SidebarMenuItem>
))

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
      <SidebarHeader>
        <div className="flex items-center justify-between my-4 py-2 px-2 border-b border-border min-h-[80px]">
          {user?.username && (
            <UserMetadata
              profileImage={user.profile?.image}
              username={user.username}
              createdAt={user.createdAt}
              plan={plan}
              className="select-none text-sm"
            />
          )}
          {header && <span className="text-sm font-semibold">{header}</span>}
        </div>
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
            <MenuSideBarItem key={item.href} item={item} onClose={() => setOpenMobile(false)} />
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Secondary Items (bottom) */}
      {secondaryItems.length > 0 && (
        <>
          <Separator className="my-2" />
          <SidebarContent className="flex-none pb-2">
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <MenuSideBarItem key={item.href} item={item} onClose={() => setOpenMobile(false)} />
              ))}
            </SidebarMenu>
          </SidebarContent>
        </>
      )}

      {children && (
        <>
          <Separator className="my-4" />
          <SidebarFooter>
            <div className="w-full text-center">{children}</div>
          </SidebarFooter>
        </>
      )}
    </Sidebar>
  )
}

export const DpNextSidebar = memo(DpNextSidebarBase)
