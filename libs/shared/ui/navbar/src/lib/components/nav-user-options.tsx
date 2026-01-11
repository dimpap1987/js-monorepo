'use client'

import { DpLogoutButton } from '@js-monorepo/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import React, { PropsWithChildren, ReactNode } from 'react'
import { IoIosSettings } from 'react-icons/io'
import { UserMetadata } from './user-metadata'
import { UserOptionsDropdown } from './user-options.component'
import { UserNavProps } from '../navbar'

/* ---------------------- User Options ---------------------- */
interface NavUserOptionsProps extends PropsWithChildren {
  user: UserNavProps
  plan?: string | null
  onLogout?: () => void
  className?: string
}

const NavUserOptions: React.FC<NavUserOptionsProps> = ({ user, plan, onLogout, className, children }) => {
  return (
    <UserOptionsDropdown className={className}>
      <UserMetadata
        profileImage={user.profile?.image}
        username={user.username}
        createdAt={user.createdAt}
        plan={plan}
        className="mb-2 border-border border-b select-none"
      />

      {children}

      <DpLogoutButton className="text-sm" onClick={onLogout} role="menuitem" />
    </UserOptionsDropdown>
  )
}

export { NavUserOptions, type NavUserOptionsProps }
