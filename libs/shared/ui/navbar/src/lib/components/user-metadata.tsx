'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@js-monorepo/components/ui/avatar'
import { PlanBadge } from '@js-monorepo/payments-ui'
import { cn } from '@js-monorepo/ui/util'
import { FaAt } from 'react-icons/fa'
import { formatForUser } from '@js-monorepo/utils/date'
import { useTimezone } from '@js-monorepo/next/hooks'

export function UserMetadata({
  profileImage,
  username,
  createdAt,
  plan,
  className,
}: {
  profileImage?: string | null
  username?: string | null
  createdAt?: string | null | Date
  plan?: string | null
  className?: string | null
}) {
  const userTimezone = useTimezone()
  return (
    <div className={cn('px-1 py-4 flex gap-3 items-center w-full', className)}>
      <Avatar className="h-10 w-10">
        {profileImage && <AvatarImage src={profileImage} alt={`${username} picture`}></AvatarImage>}
        <AvatarFallback className="text-sm font-semibold">{username?.slice(0, 2)?.toUpperCase() || 'A'}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="font-semibold flex items-center gap-1.5 text-sm justify-between">
          <span className="truncate flex gap-1 items-center">
            <FaAt className="text-foreground-muted flex-shrink-0" />
            {username}
          </span>
          <PlanBadge className="ml-1" plan={plan} />
        </div>
        {createdAt && (
          <div className="text-xs text-foreground-muted mt-1">
            Member since {formatForUser(createdAt, userTimezone, 'MMM yyyy')}
          </div>
        )}
      </div>
    </div>
  )
}
