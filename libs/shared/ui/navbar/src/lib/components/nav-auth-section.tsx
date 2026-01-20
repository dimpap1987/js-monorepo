'use client'

import { DpLoginButton } from '@js-monorepo/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { ReactNode } from 'react'
import { UserNavProps } from '../navbar'
import { NavUserOptions, NavUserOptionsProps } from './nav-user-options'

interface NavAuthSectionProps {
  user?: UserNavProps
  plan?: string | null
  onLogout?: () => void
  navUserOptionsChildren?: NavUserOptionsProps['children']
  rightActions?: ReactNode
}

export const NavAuthSection = ({ user, plan, onLogout, navUserOptionsChildren, rightActions }: NavAuthSectionProps) => {
  return (
    <>
      {/* Custom Navbar Items */}
      {rightActions}

      {/* Auth Buttons */}
      {!user ? (
        <DpNextNavLink href="/auth/login">
          <DpLoginButton />
        </DpNextNavLink>
      ) : (
        <NavUserOptions className="hidden sm:block mt-2" user={user} plan={plan} onLogout={onLogout}>
          {navUserOptionsChildren}
        </NavUserOptions>
      )}
    </>
  )
}
