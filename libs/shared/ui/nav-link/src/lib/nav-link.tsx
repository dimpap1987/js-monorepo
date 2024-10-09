'use client'
import { cn } from '@js-monorepo/ui/util'
import { useRouter } from 'next-nprogress-bar'
import { usePathname } from 'next/navigation'
import React, { ForwardedRef, forwardRef } from 'react'

export interface DpNextNavLinkProps {
  readonly href: string
  readonly children: React.ReactNode
  readonly className?: string
  readonly onClick?: () => void
  readonly activeClassName?: string
}

const DpNextNavLink = forwardRef(
  (
    { href, children, className, onClick, activeClassName }: DpNextNavLinkProps,
    ref: ForwardedRef<HTMLAnchorElement>
  ) => {
    const router = useRouter()
    const currentPath = usePathname()
    const isSamePath = `${href}` === currentPath

    return (
      <a
        ref={ref}
        href={href}
        className={cn(
          `cursor-pointer dark:[text-shadow:1px_0px_1px_hsl(var(--tw-shadow-color)) ${activeClassName && isSamePath ? activeClassName : ''}`,
          className
        )}
        onClick={(e) => {
          e.preventDefault()
          router.push(href, undefined, { disableSameURL: true })
          onClick?.()
        }}
      >
        {children}
      </a>
    )
  }
)
DpNextNavLink.displayName = 'DpNextNavLink'
export { DpNextNavLink }
