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
}

const DpNextNavLink = forwardRef(
  (
    { href, children, className, onClick }: DpNextNavLinkProps,
    ref: ForwardedRef<HTMLAnchorElement>
  ) => {
    const router = useRouter()
    const currentPath = usePathname()

    return (
      <a
        ref={ref}
        href={href}
        className={twMerge(className, 'cursor-pointer')}
        onClick={(e) => {
          e.preventDefault()
          if (`/${href}` === currentPath) {
            router.replace(href)
          } else {
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
