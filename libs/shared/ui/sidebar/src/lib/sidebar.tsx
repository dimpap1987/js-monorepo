'use client'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { AuthRole, MenuItem, SessionUserType } from '@js-monorepo/types'
import { AnimatePresence, motion } from 'framer-motion'
import { UserMetadata } from '@js-monorepo/navbar'
import { ReactNode, RefObject, useCallback, useEffect, useMemo, useRef, memo } from 'react'
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
  readonly plan?: string | null
}

const framerSidebarPanel = (position: SidebarPositionType) => ({
  initial: { x: position === 'left' ? '-100%' : '100%' },
  animate: { x: 0 },
  exit: { x: position === 'left' ? '-100%' : '100%' },
  transition: { type: 'tween', duration: 0.2, ease: 'easeOut' },
})

const framerBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { type: 'tween', duration: 0.2 },
}

const MenuSideBarItem = memo(
  ({ item, position, onClose }: { item: MenuItem; position: SidebarPositionType; onClose: () => void }) => (
    <li>
      <DpNextNavLink
        className={`flex text-sm sm:text-base items-center w-full ${
          position === 'right' ? 'flex-row-reverse' : ''
        } justify-between gap-5 p-5 transition-all border-b-2 hover:bg-zinc-800 border-border`}
        href={item.href}
        onClick={onClose}
      >
        <div className="grid grid-cols-[max-content_25px] gap-2">
          <div>{item.name}</div>
          <div>{item.Icon && <item.Icon className="text-xl" />}</div>
        </div>
      </DpNextNavLink>
    </li>
  )
)

MenuSideBarItem.displayName = 'MenuSideBarItem'

const DpNextSidebarBase = ({
  children,
  isOpen,
  onClose,
  user,
  plan,
  items = [],
  position = 'left',
  header,
}: DpNextSidebarProps) => {
  const localRef = useRef<HTMLDivElement | null>(null)

  const handleClickAway = useCallback(() => {
    if (isOpen) onClose()
  }, [onClose, isOpen])

  useClickAway(localRef as RefObject<HTMLElement | null>, handleClickAway)

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  const filteredItems = useMemo(() => {
    return items.filter(
      (item) => item.roles?.includes('PUBLIC') || item.roles?.some((role) => user?.roles?.includes(role as AuthRole))
    )
  }, [items, user?.roles])

  // Memoize panel variants
  const panelVariants = useMemo(() => framerSidebarPanel(position), [position])

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div className="fixed inset-0 bg-black bg-opacity-50 z-50 text-gray-300" {...framerBackdrop}>
          <motion.div
            {...panelVariants}
            className={`fixed top-0 bottom-0 p-2 ${
              position === 'left' ? 'left-0' : 'right-0'
            } w-full h-[100svh] max-w-xs border-r-2 border-border bg-zinc-900 flex flex-col cursor-auto md:hidden`}
            ref={localRef}
            aria-label="Sidebar"
            tabIndex={-1}
          >
            <div className="flex items-center justify-between py-4 px-1 flex-wrap-reverse border-b-2 border-border">
              {user?.username && (
                <UserMetadata
                  profileImage={user.profile?.image}
                  username={user.username}
                  createdAt={user.createdAt}
                  plan={plan}
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
              {filteredItems.map((item) => (
                <MenuSideBarItem key={item.name} item={item} position={position} onClose={onClose} />
              ))}
            </ul>
            {children && (
              <div className="mt-auto w-full text-center p-3 pb-[calc(1rem_+_env(safe-area-inset-bottom))]">
                {children}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

DpNextSidebarBase.displayName = 'DpNextSidebar'

const DpNextSidebar = memo(DpNextSidebarBase)
export { DpNextSidebar }
