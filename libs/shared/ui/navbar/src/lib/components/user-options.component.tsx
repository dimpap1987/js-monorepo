'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@js-monorepo/components/dropdown'
import { cn } from '@js-monorepo/ui/util'
import React, { ReactNode, useState } from 'react'
import { FaCircleUser } from 'react-icons/fa6'

const UserOptionsDropdown = ({ className, children }: { className?: string; children: ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <DropdownMenu open={isVisible} onOpenChange={setIsVisible}>
      <DropdownMenuTrigger className="py-1 px-2 rounded-md">
        <FaCircleUser className="text-2xl hover:cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn('w-80 p-2 px-3 rounded-xl z-30 bg-background space-y-2', className)}>
        {React.Children.map(children, (child) =>
          React.cloneElement(child as React.ReactElement, {
            onClick: () => setIsVisible(false),
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { UserOptionsDropdown }
