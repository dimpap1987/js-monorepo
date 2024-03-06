'use client'
import { useRouter } from 'next-nprogress-bar'
import { usePathname } from 'next/navigation'
import React, { ForwardedRef, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

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
        className={twMerge(
          `cursor-pointer ${activeClassName && isSamePath ? activeClassName : ''}`,
          className
        )}
        onClick={(e) => {
          e.preventDefault()
          if (!isSamePath) {
            router.push(href)
          }
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
