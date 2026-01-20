'use client'

import { DpLoginButton } from '@js-monorepo/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { ReactNode } from 'react'
import { NavUserOptions, NavUserOptionsProps } from './nav-user-options'
import { UserNavProps } from '../navbar'

interface NavAuthSectionProps {
  isLoggedIn: boolean
  user?: UserNavProps
  plan?: string | null
  onLogout?: () => void
  navUserOptionsChildren?: NavUserOptionsProps['children']
  rightActions?: ReactNode
}

export const NavAuthSection = ({
  isLoggedIn,
  user,
  plan,
  onLogout,
  navUserOptionsChildren,
  rightActions,
}: NavAuthSectionProps) => {
  return (
    <>
      {/* Custom Navbar Items */}
      {rightActions}

      {/* Auth Buttons */}
      {!isLoggedIn ? (
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
