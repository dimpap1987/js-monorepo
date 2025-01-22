'use client'

import { cn } from '@js-monorepo/ui/util'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'

export function BottomNavbar({ children, className }: PropsWithChildren & { className?: string }) {
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsVisible(currentScrollY < lastScrollY.current)
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div
      className={cn(
        'fixed bottom-0 h-[var(--bottom-navbar-height)] w-[100vw] transition-transform duration-300 overflow-hidden',
        isVisible ? 'translate-y-0' : 'translate-y-full', // slide in/out
        'dark:bg-zinc-900 dark:text-gray-300 bg-background border-t border-border',
        className
      )}
    >
      <div className="flex gap-2 justify-around h-full">{children}</div>
    </div>
  )
}
