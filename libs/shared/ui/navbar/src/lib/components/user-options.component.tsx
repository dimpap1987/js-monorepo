'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@js-monorepo/components/dropdown'
import { cn } from '@js-monorepo/ui/util'
import React, { ReactElement, ReactNode, useState } from 'react'
import { FaCircleUser } from 'react-icons/fa6'

const UserOptionsDropdown = ({ className, children }: { className?: string; children: ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <DropdownMenu open={isVisible} onOpenChange={setIsVisible}>
      <DropdownMenuTrigger className="py-1 px-2 rounded-md hover:ring-1 hover:ring-border">
        <FaCircleUser className="text-2xl hover:cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn('w-80 p-2 px-3 rounded-xl z-30 bg-background space-y-2', className)}>
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
