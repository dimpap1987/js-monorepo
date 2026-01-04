'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@js-monorepo/components/dropdown'
import { cn } from '@js-monorepo/ui/util'
import React, { ReactElement, ReactNode, useState } from 'react'
import { FaCircleUser } from 'react-icons/fa6'

const UserOptionsDropdown = ({ className, children }: { className?: string; children: ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <DropdownMenu open={isVisible} onOpenChange={setIsVisible}>
      <DropdownMenuTrigger className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <FaCircleUser className="text-xl" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn('min-w-[330px] p-3 rounded-xl bg-popover border border-border shadow-lg space-y-2', className)}
      >
        {React.Children.map(children, (child) => {
          const reactChild = child as ReactElement
          return React.cloneElement(reactChild, {
            onClick: (e: React.MouseEvent) => {
              // call the original click of child
              if (reactChild?.props?.onClick) {
                reactChild.props.onClick(e)
              }
              // Close the dropdown menu
              setIsVisible(false)
            },
          })
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { UserOptionsDropdown }
