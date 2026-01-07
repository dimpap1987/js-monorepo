'use client'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { AuthRole, MenuItem, SessionUserType } from '@js-monorepo/types'
import { UserMetadata } from '@js-monorepo/navbar'
import { ReactNode, useMemo, memo } from 'react'
import { X } from 'lucide-react'
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
import { Button } from '@js-monorepo/components/button'

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
        className="flex items-end flex-row-reverse gap-3 text-base p-3 w-full h-full"
      >
        {item.Icon && <item.Icon className="h-5 w-5" />}
        <span>{item.name}</span>
      </DpNextNavLink>
    </SidebarMenuButton>
  </SidebarMenuItem>
))

MenuSideBarItem.displayName = 'MenuSideBarItem'

const DpNextSidebarBase = ({ children, user, plan, items = [], header, className }: DpNextSidebarProps) => {
  const { setOpenMobile } = useSidebar()

  const filteredItems = useMemo(() => {
    return items.filter(
      (item) => item.roles.includes('PUBLIC') || item.roles.some((role) => user?.roles?.includes(role as AuthRole))
    )
  }, [items, user?.roles])

  return (
    <Sidebar side="right" variant="inset" collapsible="offcanvas" className={className}>
      <SidebarHeader>
        <div className="flex items-center justify-between py-4 px-2 border-b-2 border-border">
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
          size="icon"
          onClick={() => setOpenMobile(false)}
          className="md:hidden absolute top-3 right-3"
          aria-label="close sidebar"
        >
          <X className="h-5 w-5" />
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {filteredItems.map((item) => (
            <MenuSideBarItem key={item.name} item={item} onClose={() => setOpenMobile(false)} />
          ))}
        </SidebarMenu>
      </SidebarContent>

      {children && (
        <SidebarFooter>
          <div className="w-full text-center p-3">{children}</div>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}

export const DpNextSidebar = memo(DpNextSidebarBase)
