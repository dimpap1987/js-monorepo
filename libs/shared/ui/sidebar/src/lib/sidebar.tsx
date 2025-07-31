'use client'

import { DpNextNavLink } from '@js-monorepo/nav-link'
import { UserMetadata } from '@js-monorepo/navbar'
import { AuthRole, MenuItem, SessionUserType } from '@js-monorepo/types'
import { AnimatePresence, motion } from 'framer-motion'
import { ReactNode, RefObject, forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { AiOutlineRollback } from 'react-icons/ai'
import { useClickAway } from 'react-use'

export type SidebarPositionType = 'right' | 'left'

export interface DpNextSidebarProps {
  readonly children?: ReactNode
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly position?: SidebarPositionType
  readonly items: MenuItem[]
  readonly header?: string
  readonly user?: Partial<SessionUserType>
}

const framerSidebarPanel = (position: SidebarPositionType) => ({
  initial: { x: position === 'left' ? '-100%' : '100%' },
  animate: { x: 0 },
  exit: { x: position === 'left' ? '-100%' : '100%' },
  transition: { duration: 0.3 },
})

const framerText = (position: SidebarPositionType) => ({
  initial: { opacity: 0, x: position === 'left' ? -50 : 50 },
  animate: { opacity: 1, x: 0 },
  transition: { delay: 0.2 },
})

const DpNextSidebar = forwardRef<HTMLDivElement, DpNextSidebarProps>(
  ({ children, isOpen, onClose, user, items = [], position = 'left', header }, forwardedRef) => {
    const localRef = useRef<HTMLDivElement | null>(null)
    useClickAway(localRef as RefObject<HTMLElement | null>, onClose)

    const [renderItems, setRenderItems] = useState(false)

    const textAnimation = useMemo(() => framerText(position), [position])
    const sidebarAnimation = useMemo(() => framerSidebarPanel(position), [position])

    useEffect(() => {
      if (isOpen) {
        setTimeout(() => setRenderItems(true), 150)
        document.body.style.overflow = 'hidden'
        document.body.style.touchAction = 'none'
        localRef.current?.focus()
      } else {
        setRenderItems(false)
        document.body.style.overflow = ''
        document.body.style.touchAction = ''
      }

      return () => {
        document.body.style.overflow = ''
        document.body.style.touchAction = ''
      }
    }, [isOpen])

    return (
      <AnimatePresence mode="wait" initial={false}>
        {isOpen && (
          <motion.div
            layout
            className="fixed inset-0 bg-black bg-opacity-50 z-20 text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              layout
              {...sidebarAnimation}
              className={`fixed top-0 bottom-0 z-30 focus:z-50 dark p-2 ${
                position === 'left' ? 'left-0' : 'right-0'
              } w-full h-[100svh] max-w-xs border-r-2 border-border bg-zinc-900 flex flex-col cursor-auto md:hidden will-change-transform`}
              ref={localRef}
              aria-label="Sidebar"
              tabIndex={-1}
            >
              <div className="flex items-center justify-between p-5 border-b-2 border-border">
                {user?.username && (
                  <UserMetadata
                    profileImage={user.profile?.image}
                    username={user.username}
                    createdAt={user.createdAt}
                    className="select-none text-sm"
                  />
                )}
                <span>{header}</span>
                <button
                  onClick={onClose}
                  className="p-3 border-2 border-border rounded-xl hover:bg-zinc-800"
                  aria-label="close sidebar"
                >
                  <AiOutlineRollback />
                </button>
              </div>

              <ul>
                {renderItems &&
                  items?.map((item) => {
                    const shouldRenderNavLink =
                      item.roles?.includes('PUBLIC') ||
                      item.roles?.some((role) => user?.roles?.includes(role as AuthRole))

                    return (
                      shouldRenderNavLink && (
                        <li key={item.name}>
                          <DpNextNavLink
                            className={`flex text-sm sm:text-base items-center w-full ${
                              position === 'right' ? 'flex-row-reverse' : ''
                            } justify-between gap-5 p-5 transition-all border-b-2 hover:bg-zinc-800 border-border`}
                            href={item.href}
                            onClick={onClose}
                          >
                            <motion.div {...textAnimation} className="grid grid-cols-[max-content_25px] gap-2">
                              <div>{item.name}</div>
                              <div>{item.Icon && <item.Icon className="text-xl" />}</div>
                            </motion.div>
                          </DpNextNavLink>
                        </li>
                      )
                    )
                  })}
              </ul>

              {children && <div className="mt-auto w-full text-center p-3">{children}</div>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
)

DpNextSidebar.displayName = 'DpNextSidebar'
export { DpNextSidebar }
