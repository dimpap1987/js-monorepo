'use client'

import { DpButton } from '@js-monorepo/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { CreditCard } from 'lucide-react'

export function NoSubscriptionState() {
  return (
    <div className="text-center py-8">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background-secondary">
        <CreditCard className="h-8 w-8 text-foreground-muted" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No Active Subscription</h3>
      <p className="text-foreground-neutral mb-6">
        You're currently on the free plan. Upgrade to unlock premium features.
      </p>
      <DpNextNavLink href="/pricing">
        <DpButton>View Plans</DpButton>
      </DpNextNavLink>
    </div>
  )
}
