import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@js-monorepo/components/avatar'
import { cn } from '@js-monorepo/ui/util'
import { FaAt } from 'react-icons/fa'

export function UserMetadata({
  profileImage,
  username,
  createdAt,
  className,
}: {
  profileImage?: string | null
  username?: string | null
  createdAt?: string | null | Date
  className?: string | null
}) {
  return (
    <>
      <div className={cn('p-1 flex gap-4 items-center', className)}>
        <Avatar>
          {profileImage && (
            <AvatarImage
              src={profileImage}
              alt={`${username} picture`}
            ></AvatarImage>
          )}
          <AvatarFallback>
            {username?.slice(0, 2)?.toUpperCase() || 'A'}
          </AvatarFallback>
        </Avatar>

        {createdAt && (
          <div>
            <div className="font-semibold flex items-center">
              <FaAt className="text-foreground" />
              <span className="ml-1">{username}</span>
            </div>
            {createdAt && (
              <div className="text-xs italic hidden sm:block mt-1">
                created at &#x2022; {new Date(createdAt).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
