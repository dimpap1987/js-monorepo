import { cn } from '@js-monorepo/utils'
import Image from 'next/image'
import { FaAt } from 'react-icons/fa'

export default function UserMetadata({
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
    (profileImage || createdAt) && (
      <>
        <div className={cn('p-1 flex gap-4 items-center', className)}>
          {profileImage && (
            <Image
              src={profileImage}
              width={50}
              height={50}
              alt="Picture of the user"
              className="rounded-full mb-1"
            />
          )}
          {createdAt && (
            <div>
              <div className="mb-1 text-base font-semibold flex items-center">
                <FaAt className="text-foreground" />
                <span className="ml-1">{username}</span>
              </div>
              {createdAt && (
                <div className="text-xs italic">
                  created at &#x2022; {new Date(createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>
      </>
    )
  )
}
