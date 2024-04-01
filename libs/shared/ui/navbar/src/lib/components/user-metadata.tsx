import { cn } from '@js-monorepo/utils'
import Image from 'next/image'

export default function UserMetadata({
  profileImage,
  username,
  createdAt,
  className,
}: {
  profileImage?: string
  username?: string
  createdAt?: string
  className?: string
}) {
  return (
    profileImage && (
      <>
        <div className={cn('p-1 flex gap-4 items-center', className)}>
          <Image
            src={profileImage}
            width={50}
            height={50}
            alt="Picture of the user"
            className="rounded-full mb-1"
          />
          <div>
            <div className="mb-1 text-base font-semibold">{username}</div>
            {createdAt && (
              <div className="text-xs italic">joined &#x2022; {createdAt}</div>
            )}
          </div>
        </div>
      </>
    )
  )
}
