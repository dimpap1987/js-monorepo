'use client'

import { cn } from '@js-monorepo/ui/util'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'

export function BottomNavbar({ children, className }: PropsWithChildren & { className?: string }) {
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const shouldBeVisible = currentScrollY < lastScrollY.current || currentScrollY < 10

      setIsVisible(shouldBeVisible)

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 w-full',
        'h-[var(--bottom-navbar-height)]',
        'transition-transform duration-300 ease-in-out',
        'backdrop-blur-xl bg-background',
        'border-t border-border',
        'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-1px_rgba(0,0,0,0.06)]',
        'pb-[env(safe-area-inset-bottom)]',
        isVisible ? 'translate-y-0' : 'translate-y-full',
        className
      )}
    >
      <div className="flex items-center justify-evenly h-full max-w-md mx-auto">{children}</div>
    </div>
  )
}
