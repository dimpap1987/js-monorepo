import { cn } from '@js-monorepo/ui/util'
import { AnimatePresence, motion } from 'framer-motion' // Assuming you're using framer-motion
import React, {
  ForwardedRef,
  KeyboardEvent,
  forwardRef,
  useRef,
  useState,
} from 'react'
import { useClickAway } from 'react-use'

interface DropdownProps {
  className?: string
  children?: React.ReactNode
  IconComponent: React.ElementType // Define prop for the icon component
}

const UserOptionsDropdown = forwardRef(
  (
    { className, children, IconComponent }: DropdownProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const [isVisible, setIsVisible] = useState(false) // State to show/hide div
    const dropdownRef = useRef<HTMLDivElement | null>(null)
    const iconRef = useRef<HTMLDivElement | null>(null)

    useClickAway(dropdownRef, (event) => {
      const target = event.target as Node
      const icon = iconRef?.current
      if (icon?.contains(target)) return
      setIsVisible(false)
    })

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter') {
        setIsVisible((prev) => !prev)
      }
    }

    return (
      <div
        className={cn('flex items-center', className)}
        ref={ref}
        aria-label="dropdown options"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div ref={iconRef} className="select-none">
          <IconComponent
            className="text-2xl hover:cursor-pointer"
            onClick={() => setIsVisible((prev) => !prev)}
          />
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
              className="w-80 fixed right-0 mt-[15px] p-1 border border-gray-500 rounded-xl text-foreground z-30 shadow-2xl bg-background"
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
