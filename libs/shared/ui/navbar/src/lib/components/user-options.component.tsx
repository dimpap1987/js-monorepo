import { cn } from '@js-monorepo/ui/util'
import { AnimatePresence, motion } from 'framer-motion'
import React, { KeyboardEvent, forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useClickAway } from 'react-use'

export type OptionsDropdownRef = {
  setVisibility: (visible: boolean) => void
}
interface DropdownProps {
  className?: string
  children?: React.ReactNode
  IconComponent: React.ElementType
}

const UserOptionsDropdown = forwardRef<OptionsDropdownRef, DropdownProps>(
  ({ className, children, IconComponent }: DropdownProps, ref) => {
    const [isVisible, setIsVisible] = useState(false) // State to show/hide div
    const dropdownRef = useRef<HTMLDivElement | null>(null)
    const iconRef = useRef<HTMLDivElement | null>(null)

    useClickAway(dropdownRef, (event) => {
      const target = event.target as Node
      const icon = iconRef?.current
      if (icon?.contains(target)) return
      setIsVisible(false)
    })

    useImperativeHandle(
      ref,
      () => ({
        setVisibility(visible: boolean) {
          setIsVisible(visible)
        },
      }),
      []
    )

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter') {
        setIsVisible((prev) => !prev)
      }
    }

    return (
      <div
        className={cn('flex items-center', className)}
        aria-label="dropdown options"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div ref={iconRef} className="select-none">
          <IconComponent className="text-2xl hover:cursor-pointer" onClick={() => setIsVisible((prev) => !prev)} />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {isVisible && (
            <motion.div
              {...{
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
                transition: { duration: 0.2 },
              }}
              ref={dropdownRef}
              className="w-80 fixed right-0 mt-navbar p-2 px-3 border border-gray-500 rounded-xl text-foreground z-30 shadow-2xl bg-background space-y-2"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

export { UserOptionsDropdown }
