'use client'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { AnimatePresence, motion } from 'framer-motion'
import { ReactNode, RefObject, forwardRef, useEffect, useRef } from 'react'
import { AiOutlineRollback } from 'react-icons/ai'
import { IconType } from 'react-icons/lib'
import { useClickAway } from 'react-use'

export type SidebarPositionType = 'right' | 'left'

export type MenuItem = {
  name: string
  href: string
  Icon?: IconType
}
export interface DpNextSidebarProps {
  readonly children?: ReactNode
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly position?: SidebarPositionType
  readonly items: MenuItem[]
  readonly header?: string
}

const framerSidebarPanel = (position: SidebarPositionType) => ({
  initial: { x: position === 'left' ? '-100%' : '100%' },
  animate: { x: 0 },
  exit: { x: position === 'left' ? '-100%' : '100%' },
  transition: { duration: 0.3 },
})

const framerText = (delay: number, position: SidebarPositionType) => {
  return {
    initial: { opacity: 0, x: position === 'left' ? -50 : 50 },
    animate: { opacity: 1, x: 0 },
    transition: {
      delay: 0.5 + delay / 10,
    },
  }
}

const framerIcon = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  transition: {
    type: 'spring',
    stiffness: 260,
    damping: 20,
    delay: 1.5,
  },
}

const DpNextSidebar = forwardRef<HTMLDivElement, DpNextSidebarProps>(
  (
    { children, isOpen, onClose, items = [], position = 'left', header },
    forwardedRef
  ) => {
    const localRef = useRef<HTMLDivElement | null>(null)
    useClickAway(localRef as RefObject<HTMLElement | null>, () => onClose())
    useEffect(() => {
      if (isOpen && localRef?.current) {
        localRef.current.focus()
      }
    }, [isOpen, localRef])

    return (
      <AnimatePresence mode="wait" initial={false}>
        {isOpen && (
          <motion.div
            {...framerSidebarPanel(position)}
            className={`fixed top-0 bottom-0 z-20 focus:z-50 ${
              position === 'left' ? 'left-0' : 'right-0'
            } w-full h-screen max-w-xs border-r-2 border-border bg-zinc-900 flex flex-col cursor-auto md:hidden`}
            ref={localRef}
            aria-label="Sidebar"
            tabIndex={-1}
          >
            <div className="flex items-center justify-between p-5 border-b-2 border-border">
              <span>{header}</span>
              <button
                onClick={() => onClose()}
                className="p-3 border-2 border-border rounded-xl hover:bg-zinc-800"
                aria-label="close sidebar"
              >
                <AiOutlineRollback className="text-white" />
              </button>
            </div>
            <ul>
              {items?.map(({ name, href, Icon }, idx) => {
                return (
                  <li key={name}>
                    <DpNextNavLink
                      className={`flex items-center w-full ${
                        position === 'right' ? 'flex-row-reverse' : ''
                      } justify-between gap-5 p-5 px-8 transition-all border-b-2 hover:bg-zinc-800 border-border`}
                      href={href}
                      onClick={() => onClose()}
                    >
                      <motion.span
                        {...framerText(idx, position)}
                        className="text-white"
                      >
                        {name}
                      </motion.span>
                      {Icon && (
                        <motion.div {...framerIcon}>
                          <Icon className="text-2xl" />
                        </motion.div>
                      )}
                    </DpNextNavLink>
                  </li>
                )
              })}
            </ul>
            {children && (
              <div className="mt-auto w-full text-center p-3">{children}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
)

DpNextSidebar.displayName = 'DpNextSidebar'
export { DpNextSidebar }
